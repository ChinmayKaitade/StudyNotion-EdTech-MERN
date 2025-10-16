const cloudinary = require("cloudinary").v2; // Import the Cloudinary SDK (version 2)

/**
 * @function cloudinaryConnect
 * @description Configures and initializes the Cloudinary SDK using credentials
 * stored in environment variables (CLOUD_NAME, API_KEY, API_SECRET).
 * This must be called early in the application startup process.
 */
exports.cloudinaryConnect = () => {
  try {
    // 1. Configure Cloudinary with secure credentials
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME, // Your unique Cloudinary cloud name
      api_key: process.env.API_KEY, // Your API key
      api_secret: process.env.API_SECRET, // Your API secret (must be kept private)
    });
    console.log("CD connected successfully!👍");
  } catch (error) {
    // 2. Handle configuration errors (e.g., missing environment variables)
    console.error("Error connecting to Cloudinary: " + error);
  }
};
