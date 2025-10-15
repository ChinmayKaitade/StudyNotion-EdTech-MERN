const Razorpay = require("razorpay"); // Import the Razorpay SDK

/**
 * @const instance
 * @description Exports a new, configured instance of the Razorpay client.
 * This instance uses API keys stored in environment variables to securely
 * authenticate all payment-related API calls (e.g., creating an order).
 */
exports.instance = new Razorpay({
  // Public Key ID provided by Razorpay
  key_id: process.env.RAZORPAY_KEY, // Secret Key provided by Razorpay (must be kept secure)
  key_secret: process.env.RAZORPAY_SECRET,
});
