const mongoose = require("mongoose");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");

// --------------------------------------------------------------------------------
// ✅ UPDATE COURSE PROGRESS (Mark Lecture as Complete)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function updateCourseProgress
 * @description Marks a specific sub-section (lecture) as complete for the authenticated user
 * within the given course by updating the CourseProgress document.
 * NOTE: This route must be protected by 'auth' and 'isStudent' middleware.
 * @param {object} req - Express request object (expects courseId and subsectionId in req.body, userId in req.user.id).
 * @param {object} res - Express response object.
 */
exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body;
  const userId = req.user.id; // Extracted from JWT payload

  try {
    // 1. Check if the sub-section ID is valid
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid subsection ID provided." });
    }

    // 2. Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      // This should ideally not happen if CourseProgress is created upon enrollment
      return res.status(404).json({
        success: false,
        message:
          "Course progress record does not exist. User may not be enrolled.",
      });
    } else {
      // 3. Check if the sub-section is already completed
      if (courseProgress.completedVideos.includes(subsectionId)) {
        return res.status(400).json({
          success: false,
          error: "Subsection already marked as completed.",
        });
      }

      // 4. Update and save the document
      courseProgress.completedVideos.push(subsectionId);
    }

    // Save the updated course progress
    await courseProgress.save();

    return res.status(200).json({
      success: true,
      message: "Course progress updated successfully!✅",
    });
  } catch (error) {
    console.error("Error updating course progress:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error: Could not update progress.",
    });
  }
};

// --------------------------------------------------------------------------------
// 📊 GET PROGRESS PERCENTAGE (Commented-out Logic)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function getProgressPercentage
 * @description Calculates the student's completion percentage for a given course.
 * It determines the total number of sub-sections (lectures) in the course and compares it
 * to the number of completed videos tracked in the CourseProgress document.
 * NOTE: This function needs deep population to count total lectures.
 */
exports.getProgressPercentage = async (req, res) => {
  // Removed 'exports.' from the beginning line in the original code, re-added here.
  const { courseId } = req.body;
  const userId = req.user.id;

  if (!courseId) {
    return res
      .status(400)
      .json({ success: false, error: "Course ID not provided." });
  }

  try {
    // 1. Find the course progress document and deeply populate the course content
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })
      .populate({
        path: "courseID",
        populate: {
          path: "courseContent", // Populate Sections
          populate: {
            // Deeply populate SubSections within each Section
            path: "subSection",
          },
        },
      })
      .exec();

    if (!courseProgress) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot find Course Progress record." });
    }

    // 2. Calculate the total number of lectures (SubSections)
    let lectures = 0;
    courseProgress.courseID.courseContent?.forEach((sec) => {
      // Accumulate the number of subSections in each section
      lectures += sec.subSection.length || 0;
    });

    // 3. Calculate the percentage
    let progressPercentage =
      (courseProgress.completedVideos.length / lectures) * 100;

    // 4. Format the percentage (e.g., to 2 decimal places)
    const multiplier = Math.pow(10, 2);
    progressPercentage =
      Math.round(progressPercentage * multiplier) / multiplier;

    // 5. Return response
    return res.status(200).json({
      success: true,
      data: progressPercentage,
      message: "Successfully fetched Course progress percentage.",
    });
  } catch (error) {
    console.error("Error calculating progress percentage:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error: Could not calculate progress.",
    });
  }
};
