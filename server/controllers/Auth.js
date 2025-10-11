const User = require("../models/User");
const OTP = require("../models/OTP");
// NOTE: Profile model must be imported to create the initial user profile
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt"); // Used for secure password hashing
const jwt = require("jsonwebtoken");

// sendOTP (Existing function - comments retained for context)
// ... (Your existing sendOTP function is here)
exports.sendOTP = async (req, res) => {
  try {
    // 1. Get email from the request body
    const { email } = req.body; // 2. Check if user is already registered

    const checkUserPresent = await User.findOne({ email }); // If user exists, return a 401 response since this flow is for new registration

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User Already Registered!",
      });
    } // 3. Generate a unique OTP

    let otp = otpGenerator.generate(6, {
      // Configuration to generate a 6-digit numeric OTP
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP Generated:", otp); // 4. Ensure OTP is not already in use (collision check) // Although highly unlikely for 6 digits, this prevents accidental reuse of an active OTP

    let result = await OTP.findOne({ otp: otp }); // If the generated OTP already exists in the database, regenerate until a unique one is found

    while (result) {
      otp = otpGenerator(6, {
        // Regenerate the OTP
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp }); // Re-check the database
    } // 5. Create payload for saving the new OTP document

    const otpPayload = { email, otp }; // 6. Save the OTP to the database, which automatically triggers the email sender hook (pre-save middleware)

    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody); // Log the saved document // 7. Return success response

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully!👍",
    });
  } catch (error) {
    // Handle any errors during the process (e.g., database failure, email sending failure)
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// SIGN-UP CONTROLLER
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
    } = req.body; // 2. Perform validation for mandatory fields

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
    } // 3. Validate password confirmation

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password does not match, Please try again!",
      });
    } // 4. Check if user already exists (should ideally be caught in sendOTP, but double-check is safer)

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already Registered!",
      });
    } // 5. Find the most recent OTP for the given email

    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 }) // Sort by creation date descending to get the newest OTP
      .limit(1); // Limit to only one result (the most recent one)
    console.log("Recent OTP:", recentOtp); // 6. Validate the received OTP // Check if no OTP record was found for the email (the array is empty)

    if (recentOtp.length === 0) {
      // NOTE: The condition 'recentOtp == 0' should be 'recentOtp.length === 0' for an array
      return res.status(400).json({
        success: false,
        message: "OTP not found!😓",
      });
    } // Check if the provided OTP matches the most recent stored OTP
    else if (otp !== recentOtp[0].otp) {
      // Access the 'otp' property of the first (and only) element
      return res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    }

    // 7. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds // 8. Create the initial, empty profile document

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    }); // 9. Create the main user document

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType, // Link the newly created profile document
      additionalDetails: profileDetails._id, // Generate a default avatar image URL using the DiceBear service
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    }); // 10. Return success response with user data

    // NOTE: A good practice here would be to delete the used OTP from the database.
    // await OTP.findByIdAndDelete(recentOtp[0]._id);

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
// LOG-IN CONTROLLER
// --------------------------------------------------------------------------------
/**
 * @async
 * @function login
 * @description Controller function to handle user login and authentication.
 * It verifies credentials, generates a JWT, and sets the token as an HTTP-only cookie
 * to establish an authenticated session.
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
    } // 3. Find the user by email // .populate("additionalDetails") fetches and includes the associated Profile data // in the user object for convenience.

    const user = await User.findOne({ email }).populate("additionalDetails"); // 4. Check if the user exists

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, Please Signup first",
      });
    } // 5. Verify the password // bcrypt.compare() compares the plain-text password with the stored hash

    if (await bcrypt.compare(password, user.password)) {
      // --- Authentication Success ---

      // 6. Define JWT payload
      // This data will be encoded in the token and used by middleware for authorization
      const payload = {
        email: user.email,
        id: user._id, // NOTE: Assuming 'user.role' is correctly mapped from 'user.accountType' in your model logic
        role: user.role,
      }; // 7. Generate JWT

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h", // Set token expiration time (e.g., 2 hours)
      }); // 8. Prepare user object for client response (Security measure)

      user.token = token;
      user.password = undefined; // Remove the sensitive password field // 9. Configure cookie options

      const options = {
        // Set cookie expiration (currently set to ~3 days)
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true, // Crucial security setting: prevents client-side JS from accessing the cookie
      }; // 10. Set cookie and send final success response
      res.cookie("token", token, options).status(200).json({
        success: true,
        token, // Optionally send token in body as well for client-side storage (e.g., Redux)
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

// changePassword
