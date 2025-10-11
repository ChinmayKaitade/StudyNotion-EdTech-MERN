const mongoose = require("mongoose");

/**
 * @typedef CourseProgressSchema
 * @description Defines the Mongoose Schema for the CourseProgress model.
 * This schema tracks a single student's progress through a single course.
 * It is referenced from the 'courseProgress' array within the main User model.
 */
const courseProgress = new mongoose.Schema({
  // Reference to the Course model. Identifies which course this progress record belongs to.
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // Links this record back to the specific Course
  }, // An array to store the IDs of all sub-sections (videos/lessons) the student has completed.
  completedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection", // Links to the SubSection model, which represents individual lessons/videos
    },
  ],
});

// Export the Mongoose model named 'courseProgress' based on the defined schema.
// Note: This model name is typically capitalized by convention (e.g., 'CourseProgress').
module.exports = mongoose.model("courseProgress", courseProgress);
