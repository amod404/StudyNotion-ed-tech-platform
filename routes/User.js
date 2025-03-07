const express = require("express");
const router = express.Router();

//import the controllers and middle wares
const {auth} = require("../middlewares/auth")

const {
    sendOTP,
    signUp,
    login,
    changePassword
} = require("../controllers/Auth");

const {
    resetPassword,
    resetPasswordToken,
} = require("../controllers/ResetPassword");

// routes for login, signup and authentication

router.post("/login", login);
router.post("/signup", signUp);
router.post("/sendotp", sendOTP);
router.post("/changepassword", auth, changePassword);

// router to reset the password

router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

//export
module.exports = router 