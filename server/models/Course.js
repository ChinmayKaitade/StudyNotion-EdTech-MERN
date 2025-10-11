const mongoose = require("mongoose");

/**
 * @typedef CourseSchema
 * @description Defines the Mongoose Schema for the Course model.
 * This schema is the core content structure, linking instructors, course modules (Sections),
 * pricing, ratings, and enrolled students.
 */
const courseSchema = new mongoose.Schema({
  // Name of the course. It is required and trimmed.
  courseName: {
    type: String,
    trim: true,
    required: true,
  }, // Detailed description of the course content. (optional)
  courseDescription: {
    type: String,
  }, // Reference to the User model, identifying the instructor who created this course. Required.
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the User model (specifically an Instructor user)
    required: true,
  }, // A summary field outlining the key takeaways or learning objectives for the student. (optional)
  whatYouWillLearn: {
    type: String,
  }, // An array of references to the Section model, defining the structure and content of the course.
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section", // Links to the Section model (course modules/chapters)
    },
  ], // An array of references to the RatingAndReview model, storing all feedback for this course.
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview", // Links to the RatingAndReview model
    },
  ], // The price of the course. (optional)
  price: {
    type: Number,
  }, // The URL or path to the course's thumbnail image (e.g., stored on Cloudinary). (optional)
  thumbnail: {
    type: String,
  }, // Reference to a Tag model to categorize the course (e.g., "Web Development", "Python").
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tag", // Links to the Tag model
  }, // An array of references to User models, tracking all students who have enrolled in this course.
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
