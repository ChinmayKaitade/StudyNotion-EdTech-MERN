const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto"); // Used for secure token generation (crypto.randomUUID)
const bcrypt = require("bcrypt"); // Used for password hashing and security

// --------------------------------------------------------------------------------
// 📧 RESET PASSWORD TOKEN (Forgot Password - Step 1)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function resetPasswordToken
 * @description Initiates the password reset process. It validates the user's email,
 * generates a temporary, unique token, sets a 5-minute expiration time, saves these details
 * to the User model, and sends the password reset link to the user's email.
 * @param {object} req - Express request object (expects 'email' in req.body).
 * @param {object} res - Express response object.
 */
exports.resetPasswordToken = async (req, res) => {
  try {
    // 1. Get email from the request body
    const email = req.body.email; // 2. Check if the user exists in the database

    const user = await User.findOne({ email: email }); // If the user is not found, return an error

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your Email is not registered with us, Please Register",
      });
    } // 3. Generate a unique, secure token

    const token = crypto.randomUUID(); // 4. Update user document with the new token and expiration time

    const updatedDetails = await User.findOneAndUpdate(
      { email: email }, // Query: Find the user by email
      {
        token: token, // Set the generated token // Set expiration to 5 minutes from now (5 * 60 * 1000 milliseconds)
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true, // Option to return the updated document
      }
    ); // 5. Create the password reset URL for the frontend

    const url = `http://localhost:3000/update-password/${token}`; // 6. Send the password reset email to the user

    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link: ${url}` // Email body content
    ); // 7. Return success response

    return res.status(200).json({
      success: true,
      message:
        "Email Sent Successfully!👍, Please check your email and change password",
    });
  } catch (error) {
    // Handle server/email sending failures
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!😥 While sending password reset link",
    });
  }
};

// --------------------------------------------------------------------------------
// 🔑 PASSWORD RESET (Forgot Password - Step 2)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function resetPassword
 * @description Completes the password reset process. It validates the token's existence and expiration,
 * verifies the password confirmation, hashes the new password, and updates the user's document.
 * @param {object} req - Express request object (expects password, confirmPassword, and token in req.body).
 * @param {object} res - Express response object.
 */
exports.resetPassword = async (req, res) => {
  try {
    // 1. Extract necessary data from the request body
    const { password, confirmPassword, token } = req.body; // 2. Validate password confirmation

    if (password != confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password does not match",
      });
    } // 3. Find user by the token

    const userDetails = await User.findOne({ token: token }); // 4. Validate token existence

    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token",
      });
    } // 5. Validate token expiration time

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token Expired, Please Re-generate your Token",
      });
    } // 6. Hash the new password for security

    const hashedPassword = await bcrypt.hash(password, 10); // 7. Update the user's password in the database

    await User.findOneAndUpdate(
      {
        token: token, // Query: Find the user using the valid token
      },
      {
        password: hashedPassword, // Set the new hashed password // Clear the token and expiration fields immediately after use for security
        token: null,
        resetPasswordExpires: null,
      },
      {
        new: true,
      }
    ); // 8. Return success response

    return res.status(200).json({
      success: true,
      message: "Password Reset Successfully!👍",
    });
  } catch (error) {
    // Handle server/database update failures
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!😥 While processing password reset.",
    });
  }
};
