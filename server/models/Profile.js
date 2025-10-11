const mongoose = require("mongoose");

/**
 * @typedef ProfileSchema
 * @description Defines the Mongoose Schema for the Profile model.
 * This schema stores optional and flexible additional details about a user,
 * and is linked via a one-to-one relationship from the main User model.
 */
const ProfileSchema = new mongoose.Schema({
  // User's gender (optional)
  gender: {
    type: String,
  }, // User's date of birth (stored as a string for flexibility) (optional)
  dateOfBirth: {
    type: String,
  }, // A short biography or description about the user. Trimmed to remove extra whitespace. (optional)
  about: {
    type: String,
    trim: true,
  }, // User's contact number. Stored as a Number type and trimmed. (optional)
  contactNumber: {
    type: Number,
    trim: true,
  },
});

// Export the Mongoose model named 'Profile' based on the defined schema
module.exports = mongoose.model("Profile", ProfileSchema);
