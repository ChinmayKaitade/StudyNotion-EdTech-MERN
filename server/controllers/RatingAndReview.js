const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

// --------------------------------------------------------------------------------
// ➕ CREATE RATING AND REVIEW
// --------------------------------------------------------------------------------

/**
 * @async
 * @function createRating
 * @description Controller function to handle creating a new rating and review for a course.
 * It enforces two critical checks: 1) the user must be enrolled in the course, and
 * 2) the user must not have already reviewed the course.
 * NOTE: This route must be protected by 'auth' and 'isStudent' middleware.
 * @param {object} req - Express request object (expects rating, review, courseId in req.body, and userId in req.user.id).
 * @param {object} res - Express response object.
 */
exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, review, courseId } = req.body; // 1. Check if the user is enrolled in the course

    const courseDetails = await Course.findOne({
      _id: courseId, // Use $elemMatch with $eq to efficiently check if the array contains the user ID
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    }); // Handle case where user is not enrolled

    if (!courseDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Student not enrolled in course" });
    } // 2. Check if the user has already reviewed the course

    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(404).json({
        success: false,
        message: "User has already reviewed this course",
      });
    } // 3. Create the new RatingAndReview document

    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    }); // 4. Update the Course document (add the new RatingAndReview reference)

    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    ); // 5. Return success response

    res.status(200).json({
      success: true,
      message: "Rating added successfully!👍",
      ratingReview,
    });
  } catch (error) {
    // Handle server/database errors
    console.error("Error creating rating:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------------------------------
// 🧮 GET AVERAGE RATING (Aggregation)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function getAverageRating
 * @description Controller function to calculate the average rating for a specific course.
 * It uses MongoDB's Aggregation Pipeline for efficient calculation.
 * @param {object} res - Express response object.
 * @param {object} req - Express request object (expects 'courseId' in req.body).
 */
exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId; // 1. MongoDB Aggregation Pipeline

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          // Stage 1: Filter reviews by the given course ID (must be converted to ObjectId)
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          // Stage 2: Group all matching documents
          _id: null, // Group into a single document
          averageRating: { $avg: "$rating" }, // Calculate the average of the 'rating' field
        },
      },
    ]); // 2. Handle results

    if (result.length > 0) {
      // If ratings exist, return the calculated average (result is an array with one element)
      return res.status(200).json({ averageRating: result[0].averageRating });
    } else {
      // If no ratings exist, return 0
      return res
        .status(200)
        .json({ message: "Average rating is 0", averageRating: 0 });
    }
  } catch (error) {
    console.error("Error calculating average rating:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

