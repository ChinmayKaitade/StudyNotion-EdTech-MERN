const mongoose = require("mongoose");

/**
 * @typedef RatingAndReviewSchema
 * @description Defines the Mongoose Schema for the RatingAndReview model.
 * This schema captures a student's feedback (rating and written review) on a course.
 * It is referenced by both the User (optional, for finding all reviews by a user)
 * and Course models (for aggregating all feedback for a course).
 */
const ratingAndReviewSchema = new mongoose.Schema({
  // Reference to the User model, identifying the student who submitted the rating/review. Required.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the User model (specifically a Student)
    required: true,
  }, // The numerical rating given to the course (e.g., out of 5). Required field.
  rating: {
    type: Number,
    required: true,
  }, // The written review or comment provided by the user. Required field.
  review: {
    type: String,
    required: true,
  },
});

// Export the Mongoose model named 'RatingAndReview' based on the defined schema.
module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
