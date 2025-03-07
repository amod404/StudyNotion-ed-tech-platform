const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require('otp-generator');
const initialImage = require('../utils/initial');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailSender = require("../utils/mailSender");
require('dotenv').config();

//sendOTP
exports.sendOTP = async (req,res) => {
    
    try{
        //fetch email
        const {email}  = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        //if user alread exist, then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered'
            });
        }
    
        //generate OTP
        //find optimize way
        let otp,result;
        do{
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }while(result);

        const otpPayload = {email,otp};  //date will be by default
        //entry of OTP in database
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfus
        res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp
        });
    } catch(err){
        console.log("faied in authautication -> ", err);
        return res.status(500).json({
            success:false,
            message:"something went wrong"
        })   
    }
}

//sign up
exports.signUp = async(req,res) => {

    try{
        //data fetch from request ki body (this is coming from UI/frontend)
        const {firstName, lastName, email, password, confirmPassword,accountType,contactNumber,otp} = req.body;
        // console.log(email);

        // validate krlo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp){
            return res.status(403).json({
                success:false,
                message:"All the fields are required"
            });
        }

        // 2 password match kro
        if(password !== confirmPassword){
            return res.status(404).json({
                success:false,
                message:"Password and ConfirmPassword Value does not match, please try again"
            })
        }

        // check user already exists or not
        const existingUser = await User.findOne({email});
        console.log("->>>>",existingUser);
        if(existingUser){
            return res.status(401).json({
                success:false,
                messae:"User is already registered"
            })
        }

        // find the most recent OTP stored for the user
        const recentOtp = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        // console.log(recentOtp);
        // validat OTP
        if(recentOtp && recentOtp.length === 0){
            //OTP not founded
            return res.status(405).json({
                succ:false,
                message:'OTP not found'
            })
        }
        else if(recentOtp.otp !== otp){
            console.log(recentOtp.otp)
            console.log(otp)
            return res.status(406).json({
                success:false,
                message:"Invalid OTP",
            })
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password,10);

        // Make a empty profile and save in db
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        // entry create in DB
        const imgUrl = `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`;
        const user = await User.create({
            firstName,lastName,email,contactNumber,accountType,
            password:hashedPassword,
            additionalDetails:profileDetails,
            image: imgUrl,
        })

        // return res
        return res.status(200).json({
            success:true,
            message:"user is registered successfully.",
            user
        })

    } catch(err){
        console.log("error in sign up -> ", err);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again."
        })
    }

}

//login

exports.login = async (req,res) => {

    try{
        //get data from req body
        const {email, password} = req.body;
        //validation
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fieldsare required, please try again",
            });
        }
        //user exist or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(402).json({
                success:false,
                message:"User is not registered, please signup first",
            });
        }
        //password match        
        //generate JWT
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email: user.email,
                id:user._id,    // use somewhere ---eq(#)
                accountType:user.accountType
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            // user = user.toObject();
            user.token = token;
            user.password = undefined;
            
            //create cookie and send res
            const option = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true
            }

            res.cookie("token", token, option).status(200).json({
                success:true,
                token,
                user,
                message:'logged in successfully'
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect'
            })
        }
    } catch(err){
        console.log('Error in login -> ', err)
        return res.status(500).json({
            success:false,
            message:'login Failure, please try again'
        });
    }

}

//changePassword

exports.changePassword = async (req,res) => {
    try{
        //get data from req body
        const userId = req.user.id
        const details = await User.findById(userId);
        //get oldPassword, newPassword, confirmNewPassword
        const {oldPassword, newPassword, confirmNewPassword} = req.body;
        //validation
        if(!confirmNewPassword !== newPassword){
            return res.status(401).json({
                success:false,
                message:"Confirmation do not match."
            });
        }

        //check if password is correct
        const isMatched = await bcrypt.compare(oldPassword,details.password);
        if(!isMatched){
            return res.status(402).json({
                success:false,
                mesage:"Password is incorrect."
            });
        }

        //update pwd in DB
        const encryptedPassword = await bcrypt.hash(newPassword,10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            userId,
            {password:encryptedPassword},
            {new:true}
        );

        //send mail - Password updated
        try{
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
                "<h1>Password updated successfully</h1>"
            );

            console.log("Email sent successfully : ", emailResponse);


        } catch(err){
            console.log(err);
            return res.status(403).json({
                success:false,
                error:err.message,
                message:"error in sending mail."
            })
        }


        //return response
        return res.status(200).json({
            success:false,
            message:"password updated successfully."
        })

    } catch(err){
        return res.status(500).json({
            sucess:false,
            message:"something went wrong"
        })
    }
}



