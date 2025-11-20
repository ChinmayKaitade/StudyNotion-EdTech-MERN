const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { resetPasswordEmail } = require("../mail/templates/resetPasswordEmail");

// ================ resetPasswordToken ================
exports.resetPasswordToken = async (req, res) => {
  try {
    // extract email
    const { email } = req.body;

    // 1. Email validation - Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your Email is not registered with us",
      });
    }

    // 2. Generate token (20 bytes, converted to hex string)
    const token = crypto.randomBytes(20).toString("hex");

    // 3. Update user by adding token & token expire date (5 minutes)
    // We use .exec() here for explicit promise return if not already using it.
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { token: token, resetPasswordTokenExpires: Date.now() + 5 * 60 * 1000 }, // 5 minutes validity
      { new: true }
    ).exec();

    // Determine the user's name for personalization (default to "Student" if firstName is missing)
    const userName = updatedUser.firstName ? updatedUser.firstName : "Student";

    // 4. Create the secure URL
    const url = `https://studynotion-edtech-mern.vercel.app/update-password/${token}`;

    // 5. Send email containing the styled HTML link
    // 💡 FIX APPLIED: Using the structured HTML template
    await mailSender(
      email,
      "StudyNotion: Password Reset Request for Your Account",
      resetPasswordEmail(url, userName)
    );

    // 6. Return success response
    res.status(200).json({
      success: true,
      message:
        "Email sent successfully. Please check your mail box to reset your password.",
    });
  } catch (error) {
    console.log("Error while creating token for reset password");
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while creating token for reset password",
    });
  }
};

// ================ resetPassword ================
exports.resetPassword = async (req, res) => {
  try {
    // extract data
    // extract token by anyone from this 3 ways
    const token =
      req.body?.token ||
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    const { password, confirmPassword } = req.body;

    // validation
    if (!token || !password || !confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "All fiels are required...!",
      });
    }

    // validate both passwords
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Passowrds are not matched",
      });
    }

    // find user by token from DB
    const userDetails = await User.findOne({ token: token });

    // check ==> is this needed or not ==> for security
    if (token !== userDetails.token) {
      return res.status(401).json({
        success: false,
        message: "Password Reset token is not matched",
      });
    }

    // console.log('userDetails.resetPasswordExpires = ', userDetails.resetPasswordExpires);

    // check token is expire or not
    if (!(userDetails.resetPasswordTokenExpires > Date.now())) {
      return res.status(401).json({
        success: false,
        message: "Token is expired, please regenerate token",
      });
    }

    // hash new passoword
    const hashedPassword = await bcrypt.hash(password, 10);

    // update user with New Password
    await User.findOneAndUpdate(
      { token },
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error while reseting password");
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while reseting password12",
    });
  }
};
