const mongoose = require("mongoose")

const tagsSchema = new mongoose.Schema({
    name:{
        type:String,
        requored:true,
        trim:true,
    },
    description:{
        type:String,
    },
    course:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        }
})

module.exports = mongoose.model("Tags", tagsSchema)


// import { Schema, model } from "mongoose"

// const tagsSchema = new Schema({
//     name:{
//         type:String,
//         requored:true,
//         trim:true,
//     },
//     description:{
//         type:String,
//     },
//     course:
//         {
//             type:Schema.Types.ObjectId,
//             ref:"Course",
//         }
// })

// export default model("Tags", tagsSchema)