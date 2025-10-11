const nodemailer = require("nodemailer");

/**
 * @async
 * @function mailSender
 * @description Utility function to send an email using Nodemailer.
 * It uses a pre-configured SMTP transporter (like Gmail or SendGrid via environment variables).
 * @param {string} email - The recipient's email address.
 * @param {string} title - The subject line of the email.
 * @param {string} body - The HTML content/body of the email.
 * @returns {object|void} Returns the Nodemailer 'info' object on success, otherwise logs the error.
 */
const mailSender = async (email, title, body) => {
  try {
    // 1. Create a Transporter object
    // This object holds the configuration for connecting to the email server (SMTP details).
    let transporter = nodemailer.createTransport({
      // Host configuration, read from environment variables (e.g., smtp.gmail.com)
      host: process.env.MAIL_HOST, // Authentication details for the sender's email account
      auth: {
        user: process.env.MAIL_USER, // Sender's email address
        pass: process.env.MAIL_PASS, // Sender's email password or App-specific password
      },
    }); // 2. Send the email using the configured transporter

    let info = await transporter.sendMail({
      // Sender information displayed to the recipient
      from: "StudyNotion - EdTech Platform", // Recipient's email address, passed as an argument
      to: `${email}`, // Email subject line
      subject: `${title}`, // The main content of the email (sent as HTML for rich formatting)
      html: `${body}`,
    }); // Log the success information (e.g., message ID) and return it

    console.log(info);
    return info;
  } catch (error) {
    // Log the error message if the email sending fails (e.g., bad credentials, connection timeout)
    console.log(error.message);
  }
};

// Export the mailSender function so it can be used throughout the application
module.exports = mailSender;
