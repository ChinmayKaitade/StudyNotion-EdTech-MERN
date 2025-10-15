const mongoose = require("mongoose");

/**
 * @typedef CourseSchema
 * @description Defines the Mongoose Schema for the **Course** model.
 * This schema is the core content structure, linking instructors, course modules (Sections),
 * pricing, ratings, and enrolled students, along with publication status and categories.
 */
const courseSchema = new mongoose.Schema({
  // --------------------------------------------------
  // Core Identity & Metadata
  // --------------------------------------------------
  // Name of the course. It is required and trimmed.
  courseName: {
    type: String,
    trim: true,
    required: true,
  }, // Detailed description of the course content.
  courseDescription: {
    type: String,
  }, // URL or path to the course's thumbnail image (e.g., stored on Cloudinary).
  thumbnail: {
    type: String,
  }, // A summary field outlining the key takeaways or learning objectives for the student.
  whatYouWillLearn: {
    type: String,
  }, // The price of the course.
  price: {
    type: Number,
  }, // Publication status of the course. Used to hide drafts from the public catalog.
  status: {
    type: String,
    enum: ["Draft", "Published"],
  }, // -------------------------------------------------- // 🔗 References & Content Structure // -------------------------------------------------- // Reference to the User model, identifying the instructor who created this course. Required.

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the User model (specifically an Instructor user)
    required: true,
  }, // Single reference to the Category model for primary classification. (optional)
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  }, // Array of strings used for smaller classifications/keywords (tags). Required.
  tag: {
    type: [String],
    required: true,
  }, // An array of references to the Section model, defining the structure and content modules.
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section", // Links to the Section model (course modules/chapters)
    },
  ], // An array of strings outlining any special instructions or requirements for the course.
  instructions: {
    type: [String],
  }, // An array of references to the RatingAndReview model, storing all feedback for this course.
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview", // Links to the RatingAndReview model
    },
  ], // Array tracking all students who have enrolled in this course.
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User model (specifically Student users)
      required: true,
    },
  ],
});

// Export the Mongoose model named 'Course' based on the defined schema.
module.exports = mongoose.model("Course", courseSchema);
