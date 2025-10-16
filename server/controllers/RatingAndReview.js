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

