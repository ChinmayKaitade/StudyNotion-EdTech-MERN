// Import the required modules
const express = require("express");
const router = express.Router();

// Import controller functions for payment logic
const {
  capturePayment,
  verifySignature,
  sendPaymentSuccessEmail,
} = require("../controllers/Payments");

// Import authentication and authorization middleware
const { auth, isStudent } = require("../middlewares/auth"); // isInstructor and isAdmin are imported but not used here

// --------------------------------------------------------------------------------
// 💳 Payment Routes (Enrollment Flow)
// --------------------------------------------------------------------------------

// Route to capture payment and initiate the order with Razorpay
// Requires authentication and is restricted to students
router.post("/capturePayment", auth, isStudent, capturePayment);

// Route to verify the payment signature from Razorpay Webhook
// This route is typically publicly accessible to Razorpay but the payment logic
// handles security via HMAC verification (though auth is often added here for layered security)
router.post("/verifyPayment", auth, verifySignature);

// Route to manually send a payment success email (e.g., if initial email failed)
// Requires authentication
router.post("/sendPaymentSuccessEmail", auth, sendPaymentSuccessEmail);

// Export the router for use in the main application
module.exports = router;
