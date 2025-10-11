const mongoose = require("mongoose");

/**
 * @typedef SubSectionSchema
 * @description Defines the Mongoose Schema for the SubSection model.
 * This represents an individual lecture, video, or lesson component within a course Section.
 */
const subSection = new mongoose.Schema({
  // The name or title of the video/lesson (optional)
  title: {
    type: String,
  }, // The duration of the video content, stored as a string (e.g., "10:35") (optional)
  timeDuration: {
    type: String,
  }, // A brief description of the sub-section content (optional)
  description: {
    type: String,
  }, // The URL or link to the hosted video file (e.g., stored on Cloudinary) (optional)
  videoUrl: {
    type: String,
  },
});

// Export the Mongoose model named 'SubSection' based on the defined schema.
// Note: This model name is capitalized by convention for clear referencing in other schemas.
module.exports = mongoose.model("SubSection", subSection);
