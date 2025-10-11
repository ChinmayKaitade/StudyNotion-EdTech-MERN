const mongoose = require("mongoose");

/**
 * @typedef UserSchema
 * @description Defines the Mongoose Schema for the User model.
 * This model serves as the foundation for all users (Student, Instructor, Admin)
 * and links to other critical models like Profile, Course, and CourseProgress.
 */
const UserSchema = new mongoose.Schema({
  // User's first name. It's required and extra whitespace is removed (trimmed).
  firstName: {
    type: String,
    required: true,
    trim: true,
  }, // User's last name. It's required and trimmed.
  lastName: {
    type: String,
    required: true,
    trim: true,
  }, // User's unique email address, used for login and identification. Required and trimmed.
  email: {
    type: String,
    required: true,
    trim: true,
  }, // User's hashed password. It's required and will be stored after hashing (e.g., using Bcrypt).
  password: {
    type: String,
    required: true,
  }, // Defines the role/type of the user in the system. Required field.
  accountType: {
    type: String, // Restricts the value to one of the following roles
    enum: ["Admin", "Student", "Instructor"],
    required: true,
  }, // A reference to the separate Profile schema for storing non-essential, flexible user details (e.g., gender, dateOfBirth, contactNumber).
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Profile", // This is the name of the referenced model
  }, // Array of courses associated with the user. // For Students: Courses they have enrolled in. // For Instructors: Courses they have created.
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Links to the Course model
    },
  ], // URL or path to the user's profile picture/avatar. Required for display purposes.
  image: {
    type: String,
    required: true,
  }, // Array to track the progress of the user through various courses. // Specifically stores references to the CourseProgress model.
  courseProgress: [
    {
      type: mongoose.Schema.Types.ObjectId, // NOTE: The 'required' property here seems intended to be 'ref'. // Assuming the model name is CourseProgress for referencing.
      ref: "CourseProgress",
    },
  ],
});

// Export the Mongoose model named 'User' based on the defined schema
module.exports = mongoose.model("User", UserSchema);
