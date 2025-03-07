const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const cloudinary = require("cloudinary");
const { uploadImageToCloudinary } = require("../utils/imageUploader");


exports.updateProfile = async (req,res) =>{
    try{
        //fetch data
        const {dateOfBirth="", about="", contactNumber="", gender=""} = req.body;
        console.log("->>",dateOfBirth);
        //get user ID
        const id = req.user.id;
        //validation 
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                messae:"All feilds are required."
            });
        }
        //find the profile 
        const userDetail = await User.findById(id);
        const profileId = userDetail.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        
        //update the profile
        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        
        console.log("->>>>",dateOfBirth);
        //save in db
        await profileDetails.save();
        
        //return res
        return res.status(200).json({
            success:true,
            message:"profile saved succesfully",
            profileDetails,
        });

    } catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            error:err.message,
            message:"Something went wrong. please try again."
        })
    }
}

//delete account
//explore -> cronjob, how can we schedule a process
exports.deleteAccount = async (req,res) => {
    try{
        //get id 
        const id = req.user.id;

        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"User not found."
            });
        }

        //delete the profile image from cloudinary
        const publicId = userDetails?.image?.split("/")?.slice(-2)?.join("/")?.split(".")?.[0];
        console.log(publicId);
        if(publicId){
          const result = await cloudinary.uploader.destroy(publicId);
          console.log("Cloudinary delete response:", result);
        }

        //delete the profile
        await Profile.findByIdAndDelete(userDetails.additionalDetails);

        //HW -> how can you reduce the number of unenroll user from all enrolled courses
        await Promise.all(userDetails.courses.map (courseId => 
          Course.findByIdAndUpdate(courseId,{ $pull : {studentsEnrolled:id}})
        ));


        //delete user 
        await User.findByIdAndDelete(id);
        
        //return response
        return res.status(200).json({
            success:true,
            message:"User deleted successfully"
        })
    } catch(err){
      console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong. plz try again later."
        })
    }
}


exports.getUserDetails = async (req,res) =>{
    try{
        // fetch the id
        const id = req.user.id;

        //validation
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        if(!userDetails){
            return res.status(404).json({
                sucess:false,
                message:`Something went wrong to fetch data with id : ${id}`
            })
        }
        
        //return res
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully.",
            userDetails:userDetails
        })

    } catch(err){
        return res.status(500).json({
            success:false,
            message:"Something went wrong. plz try again."
        });
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id;
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};

exports.getAllUserDetails = async (req,res) => {
    try{

        const userDetails = await User.find({}).populate();

        return res.status(200).json({
            success:true,
            data:userDetails,
            message:"details of all the users are fetched successfully."
        });

    } catch(err){
        return res.status(500).json({
            success:false,
            error:err.message,
            message:"Something went wrong."
        });
    }
}


exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};

// Schedule a job to run 5 days from now
// const date = new Date();
// date.setDate(date.getDate() + 5);

// schedule.scheduleJob(date, async function() {
//     try {
//         // Your scheduled task logic here
//         console.log('Scheduled task executed after 5 days');
//         // You can add any function you want to execute here
//     } catch (err) {
//         console.error('Error executing scheduled task:', err);
//     }
// });