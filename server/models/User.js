const mongoose = require("mongoose");

/**
 * @typedef UserSchema
 * @description Defines the Mongoose Schema for the **User** model.
 * This model serves as the foundation for all users (Student, Instructor, Admin)
 * and includes core authentication fields, roles, profile links, and data related to courses and progress.
 */
const UserSchema = new mongoose.Schema({
  // --------------------------------------------------
  // 🔑 Core Authentication & Identity Fields
  // --------------------------------------------------
  firstName: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends of a string
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  }, // Must be unique for login. Required and trimmed.
  email: {
    type: String,
    required: true,
    trim: true,
  }, // Stores the securely hashed password (e.g., using Bcrypt). Required.
  password: {
    type: String,
    required: true,
  }, // Defines the role/type of the user in the system. Required field.
  accountType: {
    type: String, // Restricts the value to one of the following predefined roles
    enum: ["Admin", "Student", "Instructor"],
    required: true,
  }, // URL or path to the user's profile picture/avatar. Required for display purposes.
  image: {
    type: String,
    required: true,
  }, // -------------------------------------------------- // 🔗 References to Other Models // -------------------------------------------------- // One-to-one link to the separate Profile schema for storing non-essential details.

  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Profile", // Links to the Profile model
  }, // Array of courses associated with the user. // For Students: Courses they have enrolled in. // For Instructors: Courses they have created/own.
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Links to the Course model
    },
  ], // Array to track the progress of the user through various courses.
  courseProgress: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseProgress", // Links to the CourseProgress model
    },
  ], // -------------------------------------------------- // 🔒 Password Reset Fields // -------------------------------------------------- // Stores a temporary token generated for the 'Forgot Password' flow.

  token: {
    type: String,
  }, // Timestamp indicating when the password reset token expires. // Used to ensure the token is time-limited for security.
  resetPasswordExpires: {
    type: Date,
  },
});

// Export the Mongoose model named 'User' based on the defined schema
module.exports = mongoose.model("User", UserSchema);
