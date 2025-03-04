const Tag = require('../models/Tags');

//create Tag ka handler function

exports.createTag = async (req,res) => {
    try{
        //fetch name and description from body
        const {name, description}  = req.body;

        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        //create entry for tag
        const tagDetails = await Tag.create({
            name:name,
            description:description
        });
        console.log(tagDetails);
        
        //return res
        return res.status(200).json({
            success:true,
            message:"Tag Created Successfully"
        })

    } catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

//get all tags

exports.showAllTags = async (req,res) => {
    try{
        const allTags = await Tag.find({},{name:true,description:true});
            res.status(200).json({
                success:true,
                message:"All tags returned succssfuly",
                allTags,
            })
    } catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}