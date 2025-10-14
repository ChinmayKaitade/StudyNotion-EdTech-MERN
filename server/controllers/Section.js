const Section = require("../models/Section");
const Course = require("../models/Course");

// --------------------------------------------------------------------------------
// ➕ CREATE SECTION (Module/Chapter)
// --------------------------------------------------------------------------------

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
        message:
          "Missing Properties. All fields are required (sectionName and courseId)",
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
    ); // NOTE: For the frontend to properly display the updated course, it should // fully populate the returned updatedCourseDetails (e.g., populate('courseContent').populate('subSection')). // 5. Return success response

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

// --------------------------------------------------------------------------------
// ✏️ UPDATE SECTION (Module/Chapter)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function updateSection
 * @description Controller function for updating the name of an existing Section (module).
 * It validates required IDs and updates the Section document directly.
 * NOTE: This route should be protected by 'auth' and 'isInstructor' middleware.
 * @param {object} req - Express request object (expects 'sectionName' and 'sectionId' in req.body).
 * @param {object} res - Express response object.
 */
exports.updateSection = async (req, res) => {
  try {
    // 1. Extract necessary data
    const { sectionName, sectionId } = req.body; // 2. Validation: Check if mandatory fields are missing

    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing Properties. All fields are required (sectionName and sectionId)",
      });
    } // 3. Update the Section document

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName }, // Update payload: set the new sectionName
      { new: true } // Return the updated document
    ); // 4. Return success response

    res.status(200).json({
      success: true,
      message: "Section Updated Successfully!👍",
      data: section, // Return the updated section details
    });
  } catch (error) {
    // 5. Handle server or database errors
    console.error("Error updating section:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update section. Please try again",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// ❌ DELETE SECTION (Module/Chapter)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function deleteSection
 * @description Controller function for deleting a Section (module).
 * It performs two critical steps: deletes the Section document and removes its ID from the parent Course.
 * NOTE: It should ideally also delete all associated SubSections (lessons).
 * @param {object} req - Express request object (expects 'sectionId' in req.params).
 * @param {object} res - Express response object.
 */
exports.deleteSection = async (req, res) => {
  try {
    // 1. Get the section ID from the URL parameters
    const { sectionId } = req.params; // 3. Delete the Section document

    // NOTE: The request should ideally also include 'courseId' in the body
    // for a more efficient and secure removal from the parent course.

    // 2. Find the section to get necessary info before deleting (if needed for cleanup)
    // For simplicity, we skip fetching related SubSections here, but cleanup is vital.

    const deletedSection = await Section.findByIdAndDelete(sectionId);

    // 4. Update the Course document (Remove the reference)
    // Find the Course that contains this section and pull the reference
    await Course.findOneAndUpdate(
      { courseContent: sectionId }, // Find the course where the sectionId exists in the array
      {
        $pull: {
          courseContent: sectionId, // Remove the section ID from the courseContent array
        },
      },
      { new: true }
    ); // 5. Return success response

    // NOTE: A mandatory step is to delete all associated SubSections (lessons)
    // within the deleted Section to prevent orphaned SubSection documents.
    // Example cleanup:
    /* await SubSection.deleteMany({ _id: { $in: deletedSection.subSection } });
     */

    return res.status(200).json({
      success: true,
      message: "Section Deleted Successfully!👍",
    });
  } catch (error) {
    // 6. Handle server or database errors
    console.error("Error deleting section:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete section. Please try again",
      error: error.message,
    });
  }
};
