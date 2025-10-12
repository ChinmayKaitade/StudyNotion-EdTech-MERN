const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader"); // Utility for uploading media

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
      !tag || // The Tag ID
      !thumbnail
    ) {
      // The uploaded file
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    } // 4. Authorization & Instructor Check // Get instructor ID from the JWT payload injected by the 'auth' middleware

    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details:", instructorDetails); // Verify that the instructor exists

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
      process.env.FOLDER_NAME // Assuming FOLDER_NAME is defined in the .env file
    ); // 7. Create the new Course document

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id, // Link to the instructor
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tagDetails._id, // Link to the tag
      thumbnail: thumbnailImage.secure_url, // Use the secure URL returned by Cloudinary
    }); // 8. Update the User (Instructor) model // Add the newly created course ID to the instructor's 'courses' array

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    ); // 9. Update the Tag model (Optional but Recommended) // NOTE: The provided Tag schema only holds a single course reference, // but typically the Tag document should hold an array of course IDs. // 10. Return success response

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully!👍",
      data: newCourse, // Return the newly created course object
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
