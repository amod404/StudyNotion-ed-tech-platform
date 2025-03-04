const Profile = require("../models/Profile");
const User = require("../models/User")


exports.updateProfile = async (req,res) =>{
    try{
        //fetch data
        const {dateOfBirth="", about="", contactNumber="", gender} = req.body;
        //get user ID
        const id = req.user.id
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
        //may be we have to convert it ito object by using toObject()
        profileDetailes.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;

        //save in db
        await profileDetails.save();

        //return res
        return res.statu(200).json({
            success:true,
            message:"profile saved succesfully",
            profileDetails,
        });

    } catch(err){
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
        const id = req?.user?.id;

        //validation
        const userDetails = await User.findById(id);
        if(!userDeatials){
            return res.status(400).json({
                success:false,
                message:"User not found."
            });
        }

        //delete the profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        //HW -> how can you reduce the number of unenroll user from all enrolled courses
        
        //delete user 
        await User.findByIdAndDelete({_id:id});
        //return response
        return res.status(200).json({
            success:true,
            message:"User deleted successfully"
        })
    } catch(err){
        return res.status(500).json({
            success:true,
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





//Hw -> how can u schedule the request say 5 days