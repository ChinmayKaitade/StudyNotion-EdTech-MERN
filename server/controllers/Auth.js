const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator"); // Library used to generate random numeric/alphanumeric codes

/**
 * @async
 * @function sendOTP
 * @description Controller function to handle sending an OTP for email verification during sign-up.
 * It first checks if the user is already registered before generating and saving the new OTP.
 * @param {object} req - Express request object (expects 'email' in req.body).
 * @param {object} res - Express response object.
 */
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

// signup

// login

// changePassword
