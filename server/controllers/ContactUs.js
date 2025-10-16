const mailSender = require("../utils/mailSender"); // Utility function for sending emails

/**
 * @async
 * @function contactUs
 * @description Controller function to process contact form submissions.
 * It extracts contact details, performs validation, formats the inquiry into an HTML email,
 * and sends it to the administrative email address (CONTACT_MAIL).
 * @param {object} req - Express request object (expects contact details in req.body).
 * @param {object} res - Express response object.
 */
exports.contactUs = async (req, res) => {
  // 1. Destructure and extract data from the request body
  const { firstName, lastName, email, message, phoneNo } = req.body; // 2. Validation: Check if mandatory fields are provided
  if (!firstName || !email || !message) {
    return res.status(403).send({
      success: false,
      message: "All Fields are required (First Name, Email, Message)",
    });
  }
  try {
    // 3. Prepare the data object for the email body (handling optional fields)
    const data = {
      firstName,
      lastName: `${lastName ? lastName : "Not Provided"}`, // Use "Not Provided" instead of "null" for readability
      email,
      message,
      phoneNo: `${phoneNo ? phoneNo : "Not Provided"}`,
    }; // 4. Dynamically generate the HTML content for the email

    const htmlBody = `
        <html><body>
            <h2>New Contact Us Inquiry</h2>
            ${Object.keys(data)
              .map((key) => {
                // Creates a list of key-value pairs (e.g., <p>firstName : John</p>)
                // Ensure key is capitalized for better formatting
                const readableKey = key.charAt(0).toUpperCase() + key.slice(1);
                return `<p><strong>${readableKey}</strong>: ${data[key]}</p>`;
              })
              .join("")} 
        </body></html>
    `; // 5. Send the email using the mailSender utility

    const info = await mailSender(
      process.env.CONTACT_MAIL, // Recipient: Admin email configured in .env
      "New StudyNotion Contact Inquiry", // Subject line
      htmlBody // HTML content
    ); // 6. Check for successful email dispatch

    if (info) {
      return res.status(200).send({
        success: true,
        message:
          "Your message has been sent successfully. We will be in touch shortly!",
      });
    } else {
      // Handle failure if mailSender returns a non-truthy response
      return res.status(500).send({
        success: false,
        message: "Failed to send email. Please try again.",
      });
    }
  } catch (error) {
    // 7. Handle general server errors
    console.error("Contact form error:", error);
    return res.status(500).send({
      success: false,
      message: "An unexpected error occurred while processing your request.",
      error: error.message,
    });
  }
};
