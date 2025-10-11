const mongoose = require("mongoose");

/**
 * @typedef OTPSchema
 * @description Defines the Mongoose Schema for the OTP model.
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
    default: Date.now(), // TTL (Time-To-Live) index: Automatically deletes the document after 5 minutes (5 * 60 seconds). // This ensures that OTPs are single-use and expire quickly for security.
    expires: 5 * 60,
  },
});

// Export the Mongoose model named 'OTP' based on the defined schema.
module.exports = mongoose.model("OTP", OTPSchema);
