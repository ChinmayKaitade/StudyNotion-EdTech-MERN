const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader"); // Utility for uploading media
const Category = require("../models/Category"); // Assuming Category model is also used

// --------------------------------------------------------------------------------
// ➕ CREATE COURSE
// --------------------------------------------------------------------------------

/**
 * @async
 * @function createCourse
 * @description Controller function to handle the creation of a new course by an instructor.
 * It handles validation, uploads the thumbnail, creates the Course document, and updates the Instructor's course list.
 * NOTE: This route must be protected by 'auth' and 'isInstructor' middleware.
 * @param {object} req - Express request object (expects course details in req.body and thumbnail in req.files).
 * @param {object} res - Express response object.
 */
exports.createCourse = async (req, res) => {
  try {
    // 1. Destructure data from the request body
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body; // 2. Get the thumbnail image file from the request files object

    const thumbnail = req.files.thumbnailImage; // 3. Validation: Check if all mandatory fields are present

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag || // The Tag ID
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    } // 4. Authorization & Instructor Check: Verify instructor and fetch details

    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details:", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details not found",
      });
    } // 5. Tag Validation: Check if the provided tag ID is valid

    const tagDetails = await Tag.findById(tag);

    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag Details not found",
      });
    } // 6. Upload the thumbnail to Cloudinary

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    ); // 7. Create the new Course document

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id, // Link to the instructor
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tagDetails._id, // Link to the tag
      thumbnail: thumbnailImage.secure_url, // Use the secure URL from Cloudinary
    }); // 8. Update the User (Instructor) model // Add the newly created course ID to the instructor's 'courses' array

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    ); /*     // 9. Update the Tag model (Recommended Cleanup)
    await Tag.findByIdAndUpdate(
      { _id: tagDetails._id },
      {
        $push: {
          course: newCourse._id, // Assuming 'course' is an array in the Tag model
        },
      },
      { new: true }
    );
    */ // 10. Return success response

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully!👍",
      data: newCourse, // Return the newly created course object
    });
  } catch (error) {
    // Handle any errors during the creation process
    console.error("Error creating course:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course!😥",
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
 * @description Controller function to retrieve all courses available in the database for the public catalog.
 * It populates key relational data (Instructor, RatingAndReviews, Tag) for display.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getAllCourses = async (req, res) => {
  try {
    // 1. Enhanced Query: Fetch all courses
    const allCourses = await Course.find(
      {},
      {
        // Projection: Only include necessary fields
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor") // Embed the full Instructor document
      .populate("tag") // Embed the Tag document
      .populate("ratingAndReviews") // Embed the rating and review details
      .exec(); // Execute the query // NOTE: If the Course schema has a 'status' field, a filter for { status: "Published" } // 2. Return success response with the enriched course data

    // should be applied to hide drafts from the public view.

    return res.status(200).json({
      success: true,
      message: "Data for all courses fetched successfully!👍",
      data: allCourses,
    });
  } catch (error) {
    // 3. Handle server or database errors
    console.error("Error fetching all courses:", error);
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 📚 GET SINGLE COURSE DETAILS (Deep Dive View)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function getCourseDetails
 * @description Controller function to fetch complete, detailed information for a single course ID.
 * This query uses extensive deep population across nested references (Instructor details, Course structure, and Reviews).
 * @param {object} req - Express request object (expects 'courseId' in req.body).
 * @param {object} res - Express response object.
 */
exports.getCourseDetails = async (req, res) => {
  try {
    // 1. Get Course ID from the request body
    const { courseId } = req.body; // const userId = req.user.id; // User ID is available if 'auth' middleware is used, but not used in this specific fetch // 2. Deep Query: Find course by ID and populate all necessary details
    const courseDetails = await Course.findOne({
      _id: courseId, // Query: Find by the provided course ID
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails", // Deeply populate the linked Profile (additional details) of the instructor
        },
      })
      .populate("category") // Populate the Category document
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "user", // Populate the user who left the review
          select: "firstName lastName accountType image", // Select only specific user fields for the review
        },
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection", // Deeply populate sub-sections (lessons) within each section (module)
        },
      })
      .exec(); // Execute the query // 3. Check if course was found

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    } // 4. Return success response

    return res.status(200).json({
      success: true,
      message: "Course Details fetched successfully!👍",
      data: courseDetails, // Return the deeply populated course object
    });
  } catch (error) {
    // 5. Handle server or database errors
    console.error("Error fetching course details:", error);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error: Can't Fetch Course Data.`,
      error: error.message,
    });
  }
};
