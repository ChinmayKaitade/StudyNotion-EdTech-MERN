const cloudinary = require("cloudinary").v2; // Import the Cloudinary SDK, specifically version 2

/**
 * @async
 * @function uploadImageToCloudinary
 * @description A utility function that uploads a local file to Cloudinary with custom options.
 * This is used for storing course thumbnails, user avatars, and other media content.
 * @param {object} file - The file object to upload (often comes from 'req.files' in Express/multer setup, typically containing 'tempFilePath').
 * @param {string} folder - The name of the folder within your Cloudinary account to store the file (e.g., "StudyNotion/Thumbnails").
 * @param {number} [height] - Optional: Desired height for image transformation.
 * @param {number} [quality] - Optional: Desired quality percentage for image compression (0-100).
 * @returns {object} The response object from the Cloudinary upload API, including the secure URL and public ID.
 */
exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  // 1. Initialize options object with the mandatory folder path
  const options = { folder }; // 2. Conditionally add transformation parameters

  if (height) {
    options.height = height; // Set height for resizing/transformation
  }
  if (quality) {
    options.quality = quality; // Set quality for compression
  } // 3. Set resource type to 'auto' to allow Cloudinary to automatically determine // the file type (image, video, raw). This makes the function versatile.

  options.resource_type = "auto"; // 4. Perform the upload and return the result // file.tempFilePath is where the file is temporarily stored on the server before upload

  return await cloudinary.uploader.upload(file.tempFilePath, options);
};
