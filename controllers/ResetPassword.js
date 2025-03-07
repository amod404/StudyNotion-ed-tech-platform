const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");
const bcrypt = require('bcrypt');


//resetPasswordToken
exports.resetPasswordToken = async(req,res) => {
   
    try{
        //get email from req body
        const email = req.body.email;

        //check user for this email , email validation
        const user = await User.findOne({email});
        if(!user){
            res.status(410).json({
                success:false,
                message:"your Email is not registered with us"
            });
        }

        //generate token
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updatedDetail = await User.findOneAndUpdate({email:email},{
            token: token,
            resetPasswordExpires: Date.now() + 5*60*1000
        },{new:true});

        //create url
        const url = `http://localhost:3000/update-password/${token}`

        //send mail
        await mailSender(email,"Password Reset Link ", `Password Reset Link: ${url}`);

        //return response
        return res.status(200).json({
            success:true,
            message:"Email sent Successfully, please check email and change password"
        })

    } catch(err){
        console.log("Error in reseting pass-> ", err);
        res.status(500).json({
            success:false,
            message:"Something went wrong. Please try again."
        })
    }
}

//resetPassword

exports.resetPassword = async (req,res) => {
    
    try{

        //fetch the data
        const {password, confirmPassword, token} = req.body;

        //validation
        if(password !== confirmPassword){
            return res.status(402).json({
                success:false,
                message:"Password do not match",
            });
        }        
        //getUser detail from db using token
        const userDetails = await User.findOne({token});

        //if no entry - Invalid token
        if(!userDetails){
            return res.status(402).json({
                success:false,
                message:"Token is Invalid"
            });
        }

        //token time expiry check
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(402).json({
                success:false,
                message:"Token is expired, please regenerate your token",
            })
        }

        //password hash
        const hashedPassword = await bcrypt.hash(password,10);
        
        //password ko update kr do
        await User.findOneAndUpdate({token:token},{password:hashedPassword},{new:true})
        
        //return res
        return res.status(200).json({
            success:true,
            message:"Password changed successfully"
        })
    } catch(err){
        console.log("error->",err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong. Please try again"
        });
    }

}