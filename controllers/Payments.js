const mongoose = require("mongoose");
const {instance} = require("../config/razorpay");
const Course = require("../models/Course")
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto")
// const {courseEnrollmentEmail} = require("../mail/templates//courseEnrollmentEmail");



//capture the payment and initiate te razoray order
exports.capturePayment = async (req,res) => {
    //get course ID and userID
    const {course_id} = req.body;
    const userId = req.user.id;
    //validation
    if(!course_id){
        return res.status(400).json({
            success:false,
            message:"please provide valid course id"
        })
    }
    //validation of courseDetail
    let course;
    try{
        course = await Course.findById(course_id); 
        if(!course){
            return res.json({
                success:false,
                message:"could not find the course."
            });
        }
        //check if already payed and convert the string into object
        const uid = mongoose.Types.ObjectId(userId);  //new keyword is missing
        if(course.studentsEnrolled.includes(uid)){
            return res.status(403).json({
                success:false,
                message:"Student is already enrolled."
            });
        }

    } catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }


    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random (Date.now()).toString(),
        notes:{
            courseId:course_id,  // so that we can use it after autherization to perfor an action
            userId,
        }
    } 

    try{
        //initiate the payment using razorpay
        const paymentResponse = instance.orders.create(options);
        console.log(paymentResponse);

        //return res
        return res.status(200).json({
            succes:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId: paymentResponse.id,
            currency:(await paymentResponse).currency,
            amount:paymentResponse.amount,
            message:"paymet successfully"
        });

    } catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"could not initiate the order",
        });
    }
}



//  verify signature of razorpay and server

exports.verifySignature = async (req,res) => {
    //signature in server
    const webhookSecret = "12345678";

    //signature from razorpay 
    const signature = req.header["x-razorpay-signature"];

    //A -> hashing the signature of server with same process as razorpay
    const shasum = crypto.createHmac("sha256", webhookSecret);
    //B ->  convert in string format
    shasum.update(json.stringify(req.body));
    //C -> fetch digest
    const digest = shasum.digest("hex");

    //now match it
    
    if(signature === digest){
        console.log("Payment is Autherized");
        
        //to find this we need to do testing using proxy (after making frontend)
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            //action fulfill -> find the course and enroll the student in it

            const enrolledCourse = await Course.findOneAndUpdate(
                {_id : courseId},
                { $push: {studentsEnrolled:userId}},
                {new:true},
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"course not found",
                })
            }

            console.log(enrolledCourse);

            const enrolledStudent = User.findOneAndUpdate(
                {_id:userId},
                { $push: {courses:courseId}},
                {new:true},
            )
            if(!enrolledStudent){
                return res.status(500).json({
                    success:false,
                    message:"user not found",
                })
            }

            console.log(enrolledStudent);

            //mail send
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulation from code help",
                "congratulation , You are onboarded into a new CodeHelp Course"
            );

            //response send
            return res.status(200).json({
                success:true,
                message:"Signature verified and course added"
            });

        } catch(err){
            console.log(error);
            return res.status(500).json({
                success:true,
                message:err.message
            });
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"signature do not match."
        });
    }
}
