const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
    deleteAccount,
    updateProfile,
    getUserDetails,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
} = require("../controllers/Profile");


//profile routes
router.delete("/deleteProfile",auth , deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getUserDetails);
router.get("/getAllUserDetails", auth, getAllUserDetails);
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

//export the routes 
module.exports = router;
