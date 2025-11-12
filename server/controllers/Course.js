const Course = require("../models/course");
const User = require("../models/user");
const Category = require("../models/category");
const Section = require("../models/section");
const SubSection = require("../models/subSection");
const CourseProgress = require("../models/courseProgress");

const {
  uploadImageToCloudinary,
  deleteResourceFromCloudinary,
} = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");

// ========== CREATE NEW COURSE ==========
exports.createCourse = async (req, res) => {
  try {
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category,
      instructions: _instructions,
      status,
      tag: _tag,
    } = req.body;

    const tag = JSON.parse(_tag || "[]");
    const instructions = JSON.parse(_instructions || "[]");
    const thumbnail = req.files?.thumbnailImage;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !thumbnail ||
      !instructions.length ||
      !tag.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!status) status = "Draft";

    const instructorId = req.user?.id;
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });
    }

    const thumbnailDetails = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorId,
      whatYouWillLearn,
      price,
      category: categoryDetails._id,
      tag,
      status,
      instructions,
      thumbnail: thumbnailDetails.secure_url,
      createdAt: Date.now(),
    });

    await Promise.all([
      User.findByIdAndUpdate(instructorId, {
        $push: { courses: newCourse._id },
      }),
      Category.findByIdAndUpdate(category, {
        $push: { courses: newCourse._id },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: newCourse,
      message: "New course created successfully",
    });
  } catch (error) {
    console.error("Error while creating course:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error while creating course",
      error: error.message,
    });
  }
};

// ========== GET ALL COURSES ==========
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      "courseName courseDescription price thumbnail instructor ratingAndReviews studentsEnrolled"
    )
      .populate("instructor", "firstName lastName email image")
      .exec();

    res.status(200).json({
      success: true,
      data: allCourses,
      message: "All courses fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching all courses:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== GET COURSE DETAILS ==========
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection", select: "-videoUrl" },
      })
      .exec();

    if (!courseDetails)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((sub) => {
        totalDurationInSeconds += parseInt(sub.timeDuration || 0);
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    res.status(200).json({
      success: true,
      data: { courseDetails, totalDuration },
      message: "Course details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== GET FULL COURSE DETAILS ==========
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })
      .exec();

    if (!courseDetails)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((sub) => {
        totalDurationInSeconds += parseInt(sub.timeDuration || 0);
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos || [],
      },
    });
  } catch (error) {
    console.error("Error fetching full course details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== EDIT COURSE ==========
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = JSON.parse(JSON.stringify(req.body)); // convert safely
    const course = await Course.findById(courseId);

    if (!course) return res.status(404).json({ error: "Course not found" });

    if (req.files?.thumbnailImage) {
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    course.updatedAt = Date.now();
    await course.save();

    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })
      .exec();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error editing course:", error);
    res.status(500).json({
      success: false,
      message: "Error while updating course",
      error: error.message,
    });
  }
};

// ========== GET INSTRUCTOR COURSES ==========
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: instructorCourses,
      message: "Instructor courses fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== DELETE COURSE ==========
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    await Promise.all(
      course.studentsEnrolled.map((studentId) =>
        User.findByIdAndUpdate(studentId, { $pull: { courses: courseId } })
      )
    );

    await deleteResourceFromCloudinary(course.thumbnail);

    for (const sectionId of course.courseContent) {
      const section = await Section.findById(sectionId);
      if (section) {
        await Promise.all(
          section.subSection.map(async (subSectionId) => {
            const subSection = await SubSection.findById(subSectionId);
            if (subSection) {
              await deleteResourceFromCloudinary(subSection.videoUrl);
              await SubSection.findByIdAndDelete(subSectionId);
            }
          })
        );
        await Section.findByIdAndDelete(sectionId);
      }
    }

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Error while deleting course",
      error: error.message,
    });
  }
};
