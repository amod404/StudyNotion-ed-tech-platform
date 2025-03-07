const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require('dotenv').config();
const cloudinary = require('cloudinary');

//create SubSection

exports.createSubSection = async (req,res) => {
    try{
        //fetch data from req body
        const {sectionId,title,timeDuration, description} = req.body;
        
        //extract file/video
        const video = req?.files?.videoFile;

        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        //create a sub section
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        
        //update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            {
                $push:{
                    subSections:subSectionDetails._id,
                }
            },
            {new:true},
        ).populate("subSections");
        //return res
        res.status(200).json({
            success:true,
            message:"Subsection created successfully.",
            updatedSection:updatedSection,
        })

    } catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong. plz try again",
            error:err.message
        })
    }
}

//HW -> update subsection and delete subsection
exports.updateSubSection = async (req,res) => {
    try{
        //fetch data
        const {title, timeDuration, description, subSectionId, videoUrl} = req.body;
        //data validation
        if(!title || !timeDuration || !description || !subSectionId || !videoUrl){
            return res.status(402).json({
                success:true,
                message:"missing properties"
            });
        }

        //delete from cloudinary --- to do so we have to extract public url
        const subSectionDetails = await SubSection.findById(subSectionId);
        if (!subSectionDetails) {
            return res.status(404).json({
                success: false,
                message: "Subsection not found",
            });
        }

        if(subSectionDetails.videoUrl){
            const publicId = subSectionDetails.videoUrl.split("/upload/")[1].split(".")[0];
            await cloudinary.uploader.destroy(publicId, {resource_type: "video"});
        }//if video is not present than just delete rest of data
                
        //extract file/video
        const video = req?.files?.videoFile;
        
        //upload new video to cloudinary if exists
        if(video){
            const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        }

        //update data
        const subSection = await SubSection.findByIdAndUpdate(
            subSectionId,
            {
                title:title,
                timeDuration:timeDuration,
                description:description,
                videoUrl:uploadDetails.secure_url
            },
            {new:true}
        );
        //return res
        return res.status(200).json({
            success:true,
            message:"SubSection updated successfully."
        })

    } catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to update Section, please try again",
            error:err.message,
        })
    }    
}


exports.deleteSubSection = async (req,res) => {
    try{
        //get ID --> assuming that Id is in param
        const {sectionId, subSectionId} = req.params

        //delete from cloudinary --- to do so we have to extract public url
        const subSectionDetails = await SubSection.findById(subSectionId);
        if (!subSectionDetails) {
            return res.status(404).json({
                success: false,
                message: "Subsection not found",
            });
        }

        if(subSectionDetails.videoUrl){
            const publicId = subSectionDetails.videoUrl.split("/upload/")[1].split(".")[0];
            await cloudinary.uploader.destroy(publicId, {resource_type: "video"});
        }//if video is not present than just delete rest of data

        //find by id and delete
        await SubSection.findByIdAndDelete(subSectionId);

        //course ke array se bhi delet krni hogi
        await Section.findByIdAndUpdate(
            sectionId,
            { $pull: { subSections: subSectionId } }, // Removes sectionId from array
            { new: true }
        );

        //return res
        return res.status(200).json({
            success:true,
            message:"Section Delete Successfully",
        });

    } catch(err){
        return res.status(500).json({
            success:false,
            message:"Something Went wrong. plz try again"
        })
    }
}

