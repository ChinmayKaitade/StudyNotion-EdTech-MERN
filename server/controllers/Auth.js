const User = require("../models/User");
const OTP = require("../models/OTP");
// NOTE: Profile model must be imported to create the initial user profile
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt"); // Used for secure password hashing
const jwt = require("jsonwebtoken");
// Assuming process.env.JWT_SECRET is available via dotenv configuration

// --------------------------------------------------------------------------------
// 📧 SEND OTP CONTROLLER
// --------------------------------------------------------------------------------

/**
 * @async
 * @function sendOTP
 * @description Controller function to handle sending an OTP for email verification during sign-up.
 * It checks for existing users, generates a unique OTP, and triggers the email sender (via Mongoose pre-save hook).
 * @param {object} req - Express request object (expects 'email' in req.body).
 * @param {object} res - Express response object.
 */
exports.sendOTP = async (req, res) => {
  try {
    // 1. Get email from the request body
    const { email } = req.body;

    // 2. Check if user is already registered
    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User Already Registered!",
      });
    }

    // 3. Generate a unique OTP
    let otp = otpGenerator.generate(6, {
      // Configuration to generate a 6-digit numeric OTP
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP Generated:", otp); // 4. Ensure OTP is not already in use (collision check)

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        // Regenerate the OTP
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp }); // Re-check the database
    } // 5. Create payload for saving the new OTP document

    const otpPayload = { email, otp }; // 6. Save the OTP to the database, which automatically triggers the email sender hook

    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody); // 7. Return success response

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully!👍",
    });
  } catch (error) {
    // Handle any errors during the process
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 📝 SIGN UP CONTROLLER
// --------------------------------------------------------------------------------

/**
 * @async
 * @function signUp
 * @description Controller function to handle user registration (sign-up).
 * It verifies the OTP, validates credentials, hashes the password, and creates
 * the User and associated Profile documents.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.signUp = async (req, res) => {
  try {
    // 1. Destructure data from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // 2. Perform validation for mandatory fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 3. Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password does not match, Please try again!",
      });
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already Registered!",
      });
    }

    // 5. Find the most recent OTP for the given email
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 }) // Sort by creation date descending to get the newest OTP
      .limit(1); // Limit to only one result (the most recent one)
    console.log("Recent OTP:", recentOtp); // 6. Validate the received OTP

    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found!😓",
      });
    } else if (otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    } // 7. Hash the password for security

    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. Determine initial status (for Instructor manual approval logic, though not persisted to User model)
    let approved = accountType === "Instructor" ? false : true; // 9. Create the initial, empty Profile document

    // NOTE: If an 'approved' field exists on the User model, it should be set here.

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    }); // 10. Create the main user document

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id, // Generate a default avatar image URL
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    }); // NOTE: Good practice is to delete the used OTP from the database here. // await OTP.findByIdAndDelete(recentOtp[0]._id); // 11. Return success response with user data

    return res.status(200).json({
      success: true,
      message: "User is Registered Successfully!👍",
      user, // Return the newly created user object
    });
  } catch (error) {
    // Handle any internal server errors during registration
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again",
    });
  }
};

// --------------------------------------------------------------------------------
// 🔐 LOG-IN CONTROLLER
// --------------------------------------------------------------------------------

/**
 * @async
 * @function login
 * @description Controller function to handle user login and authentication.
 * It verifies credentials, generates a JWT, and sets the token as an HTTP-only cookie.
 * @param {object} req - Express request object (expects 'email' and 'password' in req.body).
 * @param {object} res - Express response object.
 */
exports.login = async (req, res) => {
  try {
    // 1. Destructure login credentials from the request body
    const { email, password } = req.body; // 2. Validation: Check for missing credentials

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required, try again later",
      });
    } // 3. Find the user by email

    const user = await User.findOne({ email }).populate("additionalDetails"); // 4. Check if the user exists

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, Please Signup first",
      });
    } // 5. Verify the password

    if (await bcrypt.compare(password, user.password)) {
      // --- Authentication Success ---

      // 6. Define JWT payload
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      }; // 7. Generate JWT

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h", // Set token expiration time
      }); // 8. Prepare user object for client response

      user.token = token;
      user.password = undefined; // Remove the sensitive password field // 9. Configure cookie options

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // ~3 days
        httpOnly: true, // Crucial security setting
      }; // 10. Set cookie and send final success response

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in Successfully!👍",
      });
    } else {
      // 5b. Password does not match
      return res.status(401).json({
        success: false,
        message: "Incorrect Password!😓",
      });
    }
  } catch (error) {
    // Handle internal server errors
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure, Please try again",
    });
  }
};

// --------------------------------------------------------------------------------
// 🔄 CHANGE PASSWORD CONTROLLER
// --------------------------------------------------------------------------------

/**
 * @async
 * @function changePassword
 * @description Controller function to handle password change for a logged-in user.
 * It verifies the old password against the stored hash before updating and hashing the new password.
 * NOTE: This route must be protected by the 'auth' middleware.
 * @param {object} req - Express request object (expects oldPassword, newPassword, confirmNewPassword in req.body).
 * @param {object} res - Express response object.
 */
exports.changePassword = async (req, res) => {
  try {
    // 1. Get data from the request body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    // User details are injected by the authentication middleware
    const userId = req.user.id;

    // 2. Validation: Check for mandatory fields
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // 3. Validate new password confirmation
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match.",
      });
    }

    // 4. Find the user from the database
    const user = await User.findById(userId);

    // 5. Verify the old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Old Password is incorrect. Please try again.",
      });
    }

    // 6. Check if the new password is the same as the old password (good UX)
    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the old password.",
      });
    }

    // 7. Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 8. Update the password in the database
    await User.findByIdAndUpdate(
      userId,
      { password: hashedNewPassword },
      { new: true }
    );

    // 9. Return success response
    return res.status(200).json({
      success: true,
      message: "Password updated successfully!👍",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error changing password.",
      error: error.message,
    });
  }
};
