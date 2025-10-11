const mongoose = require("mongoose");
// Import the utility function for sending emails
const mailSender = require("../utils/mailSender");

// --------------------------------------------------------------------------------
// SCHEMA DEFINITION
// --------------------------------------------------------------------------------

/**
 * @typedef OTPSchema
 * @description Defines the Mongoose Schema for the **OTP (One-Time Password)** model.
 * This schema stores temporary, time-sensitive verification codes (OTPs)
 * and is crucial for user authentication security (e.g., email verification).
 */
const OTPSchema = new mongoose.Schema({
  // The email address to which the OTP was sent. Required for verification.
  email: {
    type: String,
    required: true,
  }, // The actual One-Time Password code (usually a short, numeric or alphanumeric string). Required.
  otp: {
    type: String,
    required: true,
  }, // Timestamp for when the OTP record was created.
  createdAt: {
    type: Date,
    default: Date.now(), // TTL (Time-To-Live) Index: Automatically deletes the document after 5 minutes (5 * 60 seconds). // This ensures that OTPs are single-use and expire quickly for security.
    expires: 5 * 60,
  },
});

// --------------------------------------------------------------------------------
// HELPER FUNCTION
// --------------------------------------------------------------------------------

/**
 * @async
 * @function sendVerificationEmail
 * @description Calls the imported mailSender utility to dispatch the OTP code to the user's email.
 * @param {string} email - The recipient's email address.
 * @param {string} otp - The generated One-Time Password.
 */
async function sendVerificationEmail(email, otp) {
  try {
    // Call the mailSender utility to dispatch the email with a clear subject line
    const mailResponse = await mailSender(
      email,
      "Verification Email from StudyNotion", // Email Subject
      otp // The OTP will be formatted into the email body by the mailSender function
    );
    console.log("Email Sent Successfully!👍", mailResponse);
  } catch (error) {
    // Log the error and re-throw it so the API call/controller can handle the failure
    console.log("Error occurred while sending mail:", error.message);
    throw error;
  }
}

// --------------------------------------------------------------------------------
// PRE-SAVE MIDDLEWARE HOOK
// --------------------------------------------------------------------------------

/**
 * Mongoose 'pre' middleware hook for the 'save' operation.
 * This function ensures a verification email is sent BEFORE the OTP document
 * is officially committed to the database. This is a crucial step for the OTP flow.
 */
OTPSchema.pre("save", async function (next) {
  // Only send the email if the document is brand new, to prevent re-sending on updates
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  } // Proceed to the next middleware or the actual 'save' operation
  next();
});

// Export the Mongoose model named 'OTP' based on the defined schema.
module.exports = mongoose.model("OTP", OTPSchema);
