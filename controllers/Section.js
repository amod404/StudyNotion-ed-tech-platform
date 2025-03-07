const Section = require("../models/Section")
const Course = require("../models/Course")

exports.createSection = async (req,res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId ){
            return res.status(402).json({
                success:true,
                message:"missing properties"
            });
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course with section ObjectID
        const updateCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        ).populate({
            path: "courseContent", // Populate sections
            populate: {
                path: "subSections", // Populate subsections inside sections
            }
        });

        //return res
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updateCourseDetails,
        })
    } catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong, plz tr again",
            error:err.message,
        });
    }
}

exports.updateSection = async (req,res) => {
    try{
        //fetch data
        const {sectionName, sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId ){
            return res.status(402).json({
                success:true,
                message:"missing properties"
            });
        }

        //update data
        const section = await Section.findByIdAndUpdate(
            sectionId,
            {
                sectionName
            },
            {new:true}
        );
        //return res
        return res.status(200).json({
            success:true,
            message:"Section updated successfully."
        })

    } catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to update Section, please try again",
            error:err.message,
        })
    }
}

exports.deleteSection = async (req,res) => {
    try{
        //get ID --> assuming that Id is in param
        const {sectionId, courseId} = req.body

        //find by id and delete
        await Section.findByIdAndDelete(sectionId);
        //course ke array se bhi delet krni hogi
        await Course.findByIdAndUpdate(
            courseId,
            { $pull: { courseContent: sectionId } }, // Removes sectionId from array
            { new: true }
        );

        //rteurn res
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