const Course = require("../models/Course");
const Category = require("../models/Category")
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require('dotenv').config();

//createCourse handler function
exports.createCourse = async (req,res) => {
    try{
        //fetch data 
        const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage

        //validation 
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //check for instructor and store in db
        const userId = req.user.id;
        const InstructorDetail = await User.findById(userId);
        console.log("Instructor Details : ", InstructorDetail);
        //TODO : verification that userId and istructorDeatails._id are same 

        if(!InstructorDetail){
            return res.status(404).json({
                success:false,
                message:"Instructor Details not found",
            });
        }


        //check given category is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category Details not found"
            })
        }

        //Upload Image to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:InstructorDetail._id,
            whatYouWillLearn,
            price,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            ratingAndReviews:[]
        })

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            InstructorDetail._id,
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true},
        );

        //update the category schema
        await Category.findByIdAndUpdate(
            {_id: categoryDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:"Course Created successfully",
        });

    } catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            error:err,
            message:"someting went wrong, please try again",
        });
    }
}

//getAllCourses handler function
exports.getAllCourses = async (req,res) => {
    try{
        const allCourse = await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentEnrolled:true,
        }).populate("Instructor");
        
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourse,
        })
        

    } catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            error:err,
            message:"cannot fetch course data",
        });
    }
}

//getCourseDetails handler function
// exports.getCourseDetails = async (req, res) => {
//     try {
//         const { courseId } = req.body;
//
//         // Find course by ID and populate related fields
//         const courseDetails = await Course.findById(courseId)
//             .populate("Instructor", "name email")
//             .populate("category", "name");
//
//         if (!courseDetails) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Course not found",
//             });
//         }
//
//         return res.status(200).json({
//             success: true,
//             message: "Course details fetched successfully",
//             data: courseDetails,
//         });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({
//             success: false,
//             error: err,
//             message: "Something went wrong, please try again",
//         });
//     }
// }

exports.getCourseDetails = async (req,res) => {
    try{
        //find id
        const {courseId} = req.body;
        //find course details
        const courseDetails = await Course.findById(
            courseId
        )
        .populate(
            {
                path:"instructor",
                populate:{
                    path:"additionalDetails"
                }
            }
        )
        .populate("ratingAndReviews")
        .populate({
            path:"courseContent",
            populate:{
                path:"subSections",
            }
        })
        .populate("category",{courses:false})
        .exec();

        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`cound not find the course with ${courseId}`,
            })
        }

        return res.status(200).json({
            success:true,
            message:"course Details fetched successfully",
            data:courseDetails,
        })
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong here."
        })
    }
}
