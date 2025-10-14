const Section = require("../models/Section");
const Course = require("../models/Course");

/**
 * @async
 * @function createSection
 * @description Controller function for creating a new Section (module) for a course.
 * It creates the Section document and pushes its ID into the corresponding Course's 'courseContent' array.
 * NOTE: This route should be protected by 'auth' and 'isInstructor' middleware.
 * @param {object} req - Express request object (expects 'sectionName' and 'courseId' in req.body).
 * @param {object} res - Express response object.
 */
exports.createSection = async (req, res) => {
  try {
    // 1. Extract necessary data
    const { sectionName, courseId } = req.body; // 2. Validation: Check if mandatory fields are missing

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties. All fields are required",
      });
    } // 3. Create the new Section in the database

    const newSection = await Section.create({ sectionName }); // 4. Update the Course document // Find the parent Course by ID and push the new Section's ID into its 'courseContent' array

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id, // Add the reference to the new Section
        },
      },
      { new: true } // Return the updated Course document
    ); // 5. Return success response

    // NOTE: For the frontend to properly display the updated course,
    // it's highly recommended to fully populate the updatedCourseDetails
    // after the update (e.g., populate('courseContent').populate('subSection')).

    return res.status(200).json({
      success: true,
      message: "Section Created Successfully!👍",
      updatedCourseDetails, // Return the updated course structure
    });
  } catch (error) {
    // 6. Handle server or database errors
    console.error("Error creating section:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create section. Please try again",
      error: error.message,
    });
  }
};
