const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course");

exports.createRating = async (req,res) => {
    try{
        //get user id
        const userId = req.user.id;
        //fetch data from req data
        const {rating,review, courseId} = req.body;
        //check if user is enrolled
        const courseDetails = await Course.findOne(
            {_id:courseId, studentsEnrolled: {$elemMatch : {$eq:userId}} }
        )

        if(!courseDetails){
            return res.status(404),json({
                success:false,
                message:"Student is not enrolled in the course."
            });
        }
        //check if already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne(
            {user:userId, course:courseId}
        );
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewd."
            })
        }
        //create the ratingReview 
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course:courseId,
            user:userId
        })
        //update the course
        const updatedCourseDeatil = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    ratingAndReviews:ratingReview._id
                }
            },
            {new:true}
        )
        console.log(updatedCourseDeatil);

        //return res
        return res.status(200).json({
            success:true,
            message:"Rating and review created successfully",
            ratingReview
        })
    } catch(err){
        return res.status(500).json({
            success:false,
            messae:"something went wrong. plz try again."
        })
    }
}


exports.getAverageRating = async(req,res) => {
    try{
        //get course ID
        const courseId = req.body.courseId;
        //calculate avg rating

        const result = await RatingAndReview.aggregate(
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group:{
                    _id:null,  ///all entries in single group
                    averageRating : { $avg: "$rating"}
                }
            }
        )
        //return rating
        return res.status(200).json({
            success:true,
            averageRating: result.length > 0 ? result[0].averageRating : 0,
        });

    } catch(err){
        return res.status(500).json({
            success:false,
            message:"something went wrong, plx try again."
        })
    }
}


exports.getAllRating = async (req,res) => {
    try{  
        const allReviews = await RatingAndReview.find({})
            .sort({rating:"desc"})
            .populate({
            path: "user",
            select: "firstName lastName email image"
            })
            .populate({
            path: "course",
            select: "courseName"
            })
            .exec();

        return res.status(200).json({
            success: true,
            data: allReviews,
            message:"All review fetched successfully"
        });
        
    } catch(err){
        return res.status(500).json({
            success:false,
            message:"something went wrong, plx try again."
        })
    }
}

//HW -> course ke behalf be rating lao
exports.getRatingAndReview = async (req,res) => {
    try{
        //fetch the course ID
        const {courseId} = req.body;

        //validate
        if(!courseId){
            return res.status(403).json({
                success:false,
                message:"course Id is undefined"
            })
        }

        //find the rating associated
        const details = await Course.findById(courseId,
            {
                courseName:true,
                instructor:true,
                ratingAndReviews:true,
            }
        )
        .populate("ratingAndReviews")

        //check is details are not undefined
        if(!details){
            return res.status(404).json({
                success:false,
                message:"Course do not exist"
            })
        }

        return res.status(200).json({
            success:true,
            data:details,
            message:"Rating and Review fetch successfully."
        })

    } catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            error:err.message,
            message:"Something went wrong , please try again."
        });
    }
}



