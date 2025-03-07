// app connect
const express = require("express");
const app = express();

const courseRoutes = require('./routes/Course');
const paymentRoutes = require('./routes/Payments');
const profileRoutes = require('./routes/Profile');
const userRoutes = require('./routes/User');

const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require("./config/cloudinary")
const cookieParser = require("cookie-parser");
const cors = require("cors")
const fileUpload = require("express-fileupload")

require('dotenv').config();
const PORT = process.env.PORT || 4000;

//db connect
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:3000/", //fontend ko entertain
        credentials:true,
    })
)
app.use(fileUpload({useTempFiles: true, tempFileDir: '/tmp/'}));
// app.use(express.urlencoded({extended:true, limit: '5mb'}));
   
//cloudinary connect
cloudinaryConnect();

//routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/payment', paymentRoutes);

//def route

app.get("/", (req,res) => {
    return res.json({
        success:true,
        message:"Your server is running ..... "
    });
});

//activate the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

