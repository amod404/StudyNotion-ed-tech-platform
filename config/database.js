const mongoose = require('mongoose');
require('dotenv').config();

exports.connectDB = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then( () => console.log("DB connect successfully"))
    .catch( (error) => {
        console.log("DB connection failed");
        console.error(error);
        process.exit(1);
    })
};
