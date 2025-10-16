// Import the required modules
const express = require("express");
const router = express.Router();

// Import the required controllers and middleware functions
const {
  login,
  signup,
  sendotp,
  changePassword,
} = require("../controllers/Auth"); // Auth controllers

const { isDemo } = require("../middlewares/demo"); // Middleware for restricting changes in a demo environment (assuming existence)
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword"); // Password reset controllers

const { auth } = require("../middlewares/auth"); // Authentication middleware (JWT verification)

// ********************************************************************************************************
// 🔑 Authentication Routes (Login, Signup, OTP, Change Password)
// ********************************************************************************************************

// Route for user login (Public access)
router.post("/login", login);

// Route for user signup (Public access)
router.post("/signup", signup);

// Route for sending OTP to the user's email (Public access, usually before signup)
router.post("/sendotp", sendotp);

// Route for Changing the password (Requires user to be logged in and not in a demo environment)
router.post("/changepassword", auth, isDemo, changePassword);

// ********************************************************************************************************
// 🔒 Reset Password Routes
// ********************************************************************************************************

// Route for generating a reset password token and sending the email (Public access, requires email)
router.post("/reset-password-token", resetPasswordToken);

// Route for resetting user's password after token verification (Public access, requires token and new password)
router.post("/reset-password", resetPassword);

// Export the router for use in the main application
module.exports = router;
