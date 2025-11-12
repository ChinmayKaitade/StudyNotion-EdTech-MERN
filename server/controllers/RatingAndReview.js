const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");

// ======================= CREATE RATING & REVIEW =======================
exports.createRating = async (req, res) => {
  try {
    const { rating, review, courseId } = req.body;
    const userId = req.user.id;

    // -------- Validation --------
    if (!rating || !review || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // -------- Check if user enrolled in the course --------
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }

    // -------- Check if already reviewed --------
    const alreadyReviewed = await RatingAndReview.findOne({
      course: courseId,
      user: userId,
    });

    if (alreadyReviewed) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this course.",
      });
    }

    // -------- Create new Rating & Review --------
    const newRating = await RatingAndReview.create({
      user: userId,
      course: courseId,
      rating,
      review,
    });

    // -------- Link this rating to the course --------
    await Course.findByIdAndUpdate(courseId, {
      $push: { ratingAndReviews: newRating._id },
    });

    return res.status(201).json({
      success: true,
      data: newRating,
      message: "Rating and review created successfully.",
    });
  } catch (error) {
    console.error("Error creating rating and review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating rating and review.",
      error: error.message,
    });
  }
};

// ======================= GET AVERAGE RATING =======================
exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required.",
      });
    }

    const result = await RatingAndReview.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      averageRating: result.length > 0 ? result[0].averageRating : 0,
      message:
        result.length > 0
          ? "Average rating fetched successfully."
          : "No ratings available for this course.",
    });
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching average rating.",
      error: error.message,
    });
  }
};

// ======================= GET ALL RATINGS & REVIEWS =======================
exports.getAllRatingReview = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: -1 })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    return res.status(200).json({
      success: true,
      data: allReviews,
      message: "All reviews fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching all ratings and reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching ratings and reviews.",
      error: error.message,
    });
  }
};
