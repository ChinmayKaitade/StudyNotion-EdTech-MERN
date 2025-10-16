// Import the required modules
const express = require("express");
const router = express.Router();

// Import the Controllers
const { contactUs } = require("../controllers/ContactUs"); // Controller function for handling the contact form submission

// --------------------------------------------------------------------------------
// 📞 Contact Us Route
// --------------------------------------------------------------------------------

// Route to handle submissions from the Contact Us form (Public access)
router.post("/contactUs", contactUs);

// Export the router for use in the main application
module.exports = router;
