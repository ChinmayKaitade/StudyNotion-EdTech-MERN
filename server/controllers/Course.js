const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration"); // Utility for time conversion
const CourseProgress = require("../models/CourseProgress");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { default: mongoose } = require("mongoose"); // Needed for ObjectId conversion in aggregation

// --------------------------------------------------------------------------------
// ➕ CREATE COURSE
// --------------------------------------------------------------------------------

/**
 * @async
 * @function createCourse
 * @description Creates a new course, handles input validation, checks instructor/category validity,
 * uploads the thumbnail to Cloudinary, and updates the Instructor and Category documents with the new course ID.
 * NOTE: Protected by 'auth' and 'isInstructor' middleware.
 */
exports.createCourse = async (req, res) => {
  try {
    // 1. Get data from request
    const userId = req.user.id;
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
      status,
      instructions,
    } = req.body;
    const thumbnail = req.files.thumbnailImage;

    // 2. Validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      });
    }
    // Set status default if not provided
    if (!status || status === undefined) {
      status = "Draft";
    }

    // 3. Authorization Checks
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor", // Verify user role
    });
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      });
    }
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      });
    }

    // NOTE: Tags should be handled as an array of strings or IDs in a complete schema design.

    // 4. Upload Thumbnail
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // 5. Create Course Document
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tag, // Should ideally be an array of parsed strings/IDs
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions: instructions, // Should ideally be an array of parsed strings
    });

    // 6. Update Instructor Schema: Add course ID to the instructor's course list
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: { courses: newCourse._id },
      },
      { new: true }
    );

    // 7. Update Category Schema: Add course ID to the category's course list
    await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: { courses: newCourse._id },
      },
      { new: true }
    );

    // 8. Return Success
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🔍 GET ALL COURSES (Catalog View)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function getAllCourses
 * @description Retrieves a list of all courses with minimal data for the public catalog view.
 * It populates the instructor field.
 */
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {}, // Query filter: find all
      {
        // Projection: only include these fields
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnroled: true, // Note: Typo 'studentsEnroled' retained for schema accuracy
      }
    )
      .populate("instructor") // Populate the User document for the instructor
      .exec();

    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 📚 GET SINGLE COURSE DETAILS (Public View)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function getCourseDetails
 * @description Retrieves deep, detailed information for a single course, including nested sections, subsections, and reviews.
 */
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Deep Population Query
    const courseDetails = await Course.find({ _id: courseId })
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" }, // Deeply populate instructor profile
      })
      .populate("category")
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "user", // Deeply populate review user details
          select: "firstName lastName accountType image",
        },
      })
      .populate({
        path: "courseContent",
        populate: { path: "subSection" }, // Deeply populate sub-sections within sections
      })
      .exec();

    if (!courseDetails || courseDetails.length === 0) {
      // Check if array is empty
      return res.status(404).json({
        success: false,
        message: "Course Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course fetched successfully now",
      data: courseDetails[0], // Return the single course object
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 👨‍🏫 GET INSTRUCTOR COURSES (Dashboard View)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function getInstructorCourses
 * @description Retrieves all courses created by the authenticated instructor.
 * NOTE: Protected by 'auth' and 'isInstructor' middleware.
 */
exports.getInstructorCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all courses where the instructor ID matches the current user's ID
    const allCourses = await Course.find({ instructor: userId });

    res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// ✏️ EDIT COURSE DETAILS
// --------------------------------------------------------------------------------

/**
 * @async
 * @function editCourse
 * @description Handles partial updates to course details, including replacing the thumbnail via Cloudinary.
 * NOTE: Protected by 'auth' and 'isInstructor' middleware.
 */
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    } // Handle Thumbnail Image Update
    if (req.files) {
      console.log("thumbnail update");
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    } // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        // Handle array fields (tag, instructions) that may be sent as JSON strings
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }
    await course.save(); // Save the updated course document // Fetch the updated course details with deep population for the response
    const updatedCourse = await Course.findOne({ _id: courseId })
      .populate({ path: "instructor", populate: { path: "additionalDetails" } })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();
    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error: Failed to update course.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 📘 GET FULL COURSE DETAILS (Student/Learning View)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function getFullCourseDetails
 * @description Fetches all course details, calculates total duration, and retrieves the student's progress for the course.
 * NOTE: Protected by 'auth' middleware.
 */
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id; // 1. Deeply fetch course details (same as getCourseDetails)
    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({ path: "instructor", populate: { path: "additionalDetails" } })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec(); // 2. Get student progress count (completed videos)

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userID: userId,
    });
    console.log("courseProgressCount : ", courseProgressCount);
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    } // 3. Calculate total course duration
    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });
    const totalDuration = convertSecondsToDuration(totalDurationInSeconds); // 4. Return combined data
    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration, // Return list of completed videos, default to 'none' if progress doc is missing
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : ["none"],
      },
    });
  } catch (error) {
    console.error("Error fetching full course details:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// ❌ DELETE COURSE
// --------------------------------------------------------------------------------

/**
 * @async
 * @function deleteCourse
 * @description Permanently deletes a course and performs comprehensive database cleanup across multiple related models.
 * NOTE: Protected by 'auth' and 'isInstructor' middleware.
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body; // 1. Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    } // 2. Cleanup: Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled;
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId }, // Remove course ID from student's enrolled list
      });
    } // 3. Cleanup: Delete sections and sub-sections
    const courseSections = course.courseContent;
    for (const sectionId of courseSections) {
      const section = await Section.findById(sectionId);
      if (section) {
        const subSections = section.subSection;
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId); // Delete individual sub-sections
        }
      }
      await Section.findByIdAndDelete(sectionId); // Delete the section itself
    } // 4. Cleanup: Delete course ID from Category
    await Category.findByIdAndUpdate(course.category._id, {
      $pull: { courses: courseId },
    });

    // 5. Cleanup: Delete course ID from Instructor's course list
    await User.findByIdAndUpdate(course.instructor._id, {
      $pull: { courses: courseId },
    }); // 6. Delete the Course document

    // NOTE: Cleanup should also include deleting all associated RatingAndReview and CourseProgress documents.

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: Could not delete course.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🔍 SEARCH COURSE
// --------------------------------------------------------------------------------

/**
 * @async
 * @function searchCourse
 * @description Performs a case-insensitive search across course name, description, and tags using regex.
 */
exports.searchCourse = async (req, res) => {
  try {
    const { searchQuery } = req.body; // MongoDB $or query for searching across multiple fields

    const courses = await Course.find({
      $or: [
        { courseName: { $regex: searchQuery, $options: "i" } },
        { courseDescription: { $regex: searchQuery, $options: "i" } },
        { tag: { $regex: searchQuery, $options: "i" } },
      ],
    })
      // Populate related data for display
      .populate("instructor")
      .populate("category")
      .populate("ratingAndReviews")
      .exec();

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Error during course search:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// ✅ MARK LECTURE AS COMPLETE
// --------------------------------------------------------------------------------

/**
 * @async
 * @function markLectureAsComplete
 * @description Updates the CourseProgress document by adding a subSectionId to the 'completedVideos' array if it's not already present.
 * NOTE: Protected by 'auth' and 'isStudent' middleware.
 */
exports.markLectureAsComplete = async (req, res) => {
  const { courseId, subSectionId, userId } = req.body;

  // 1. Validation
  if (!courseId || !subSectionId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (courseId, subSectionId, userId)",
    });
  }

  try {
    // 2. Find the student's progress document for the course
    // NOTE: The code uses 'progressAlreadyExists' which suggests finding by userID and courseID.
    let progressAlreadyExists = await CourseProgress.findOne({
      userID: userId,
      courseID: courseId,
    });

    // Handle case where progress document is missing (should be created on enrollment)
    if (!progressAlreadyExists) {
      return res.status(404).json({
        success: false,
        message: "Course progress record not found for this user/course.",
      });
    }

    // 3. Check if lecture is already completed
    const completedVideos = progressAlreadyExists.completedVideos;
    if (completedVideos.includes(subSectionId)) {
      return res.status(400).json({
        success: false,
        message: "Lecture already marked as complete",
      });
    }

    // 4. Update the progress document
    // The original code was redundant: it found the array, checked, then pushed, then updated with the old array.
    // The efficient way is to use $push directly in the findByIdAndUpdate.
    await CourseProgress.findOneAndUpdate(
      { userID: userId, courseID: courseId },
      { $push: { completedVideos: subSectionId } },
      { new: true }
    );

    // 5. Return success
    return res.status(200).json({
      success: true,
      message: "Lecture marked as complete!✅",
    });
  } catch (error) {
    console.error("Error marking lecture as complete:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Could not update lecture progress.",
      error: error.message,
    });
  }
};
