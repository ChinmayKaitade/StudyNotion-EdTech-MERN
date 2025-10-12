const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader"); // Utility for uploading media

// --------------------------------------------------------------------------------
// ➕ CREATE COURSE
// --------------------------------------------------------------------------------

/**
 * @async
 * @function createCourse
 * @description Controller function to handle the creation of a new course by an instructor.
 * It handles validation, finds associated entities (Instructor, Tag), uploads the thumbnail,
 * creates the Course document, and updates the Instructor's course list.
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
      !tag ||
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
      thumbnail: thumbnailImage.secure_url, // Use the secure URL
    }); // 8. Update the User (Instructor) model // Add the newly created course ID to the instructor's 'courses' array

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    ); /* // 9. Update the Tag model (Required for catalog filtering) // NOTE: Assuming the Tag schema is modified to hold an array of course IDs:
    await Tag.findByIdAndUpdate(
      { _id: tagDetails._id },
      {
        $push: {
          course: newCourse._id, // If 'course' is an array in the Tag model
        },
      },
      { new: true }
    );
    */ // 10. Return success response

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully!👍",
      data: newCourse,
    });
  } catch (error) {
    // Handle any errors during the creation process
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course!😥",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🔍 SHOW ALL COURSES (CATALOG)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function showAllCourses
 * @description Controller function to retrieve all courses available in the database.
 * This is the primary API call for the public course catalog display.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.showAllCourses = async (req, res) => {
  try {
    // 1. Enhanced Query: Fetch all courses and deeply populate related data
    // TODO: Change the below code statement incrementally
    const allCourses = await Course.find(
      {} // Finds all documents (no filter)
    );

    return res.status(200).json({
      success: true,
      message: "Data for all courses fetched successfully!👍",
      data: allCourses,
    });
  } catch (error) {
    // 3. Handle server or database errors
    console.error("Error fetching all courses:", error);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch course data!😥",
      error: error.message,
    });
  }
};
