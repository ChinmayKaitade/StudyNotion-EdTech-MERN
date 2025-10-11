const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto"); // NOTE: Added the necessary import for crypto module

/**
 * @async
 * @function resetPasswordToken
 * @description Initiates the password reset process. It validates the user's email,
 * generates a temporary, unique token, sets an expiration time, saves these details
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
    } // 3. Generate a unique, secure token using Node's crypto module

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

    const url = `http://localhost:3000/update-password/${token}`; // NOTE: Use dynamic frontend URL in production // 6. Send the password reset email to the user

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

// resetPassword
