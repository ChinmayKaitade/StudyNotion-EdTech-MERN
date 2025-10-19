// Import necessary modules
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader"); // Utility for media upload

// --------------------------------------------------------------------------------
// ➕ CREATE SUB-SECTION (Lesson/Video)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function createSubSection
 * @description Creates a new SubSection (lesson/video), uploads the video file to Cloudinary,
 * and pushes the new SubSection's ID to the parent Section's 'subSection' array. Returns the fully updated Course structure.
 * NOTE: This route should be protected by 'auth' and 'isInstructor' middleware.
 * @param {object} req - Express request object (expects sectionId, title, description, courseId in req.body, and videoFile in req.files).
 * @param {object} res - Express response object.
 */
exports.createSubSection = async (req, res) => {
  try {
    // 1. Extract necessary information from the request
    const { sectionId, title, description, courseId } = req.body;
    const video = req.files.videoFile;

    // 2. Validation: Check if all necessary fields are provided
    if (!sectionId || !title || !description || !video || !courseId) {
      return res
        .status(404)
        .json({ success: false, message: "All Fields are Required" });
    }

    // 3. Validation: Verify that the parent section exists
    const ifsection = await Section.findById(sectionId);
    if (!ifsection) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    // 4. Upload the video file to Cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_VIDEO // Assuming FOLDER_VIDEO is configured in .env
    );

    console.log(uploadDetails);

    // 5. Create a new SubSection document
    const SubSectionDetails = await SubSection.create({
      title: title,
      // timeDuration is usually derived from the uploaded video's metadata or set later
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    // 6. Update the parent Section with the new SubSection ID
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection");

    // 7. Fetch the fully populated Course structure (Section -> SubSection) to update frontend
    const updatedCourse = await Course.findById(courseId)
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();

    // 8. Return the fully updated course
    return res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating new sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: Could not create sub-section.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// ✏️ UPDATE SUB-SECTION (Lesson/Video)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function updateSubSection
 * @description Updates an existing SubSection's title, description, and optionally replaces the video file.
 * NOTE: Protected by 'auth' and 'isInstructor' middleware.
 * @param {object} req - Express request object (expects SubsectionId, title, description, courseId in req.body, and optional videoFile in req.files).
 * @param {object} res - Express response object.
 */
exports.updateSubSection = async (req, res) => {
  try {
    // 1. Extract necessary information
    const { SubsectionId, title, description, courseId } = req.body;
    const video = req?.files?.videoFile;

    // 2. Handle video upload (if a new file is provided)
    let uploadDetails = null;
    if (video) {
      // Upload new video file
      uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_VIDEO
      );
    }

    // 3. Find the existing SubSection to use its current values for partial updates
    const existingSubSection = await SubSection.findById(SubsectionId);

    // 4. Find and update the SubSection document
    await SubSection.findByIdAndUpdate(
      { _id: SubsectionId },
      {
        // Set new values, using existing values if the new one is null/undefined
        title: title || existingSubSection.title,
        description: description || existingSubSection.description,
        // Only update videoUrl if a new file was uploaded
        videoUrl: uploadDetails?.secure_url || existingSubSection.videoUrl,
      },
      { new: true } // Return the updated document (though we fetch the course next)
    );

    // 5. Fetch the fully populated Course structure (Section -> SubSection)
    const updatedCourse = await Course.findById(courseId)
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();

    // 6. Return the fully updated course
    return res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error updating sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: Could not update sub-section.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// ❌ DELETE SUB-SECTION (Lesson/Video)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function deleteSubSection
 * @description Deletes a SubSection document and removes its ID from the parent Section's array.
 * NOTE: Protected by 'auth' and 'isInstructor' middleware.
 * @param {object} req - Express request object (expects subSectionId, sectionId, courseId in req.body).
 * @param {object} res - Express response object.
 */
exports.deleteSubSection = async (req, res) => {
  try {
    // 1. Extract IDs
    const { subSectionId, courseId } = req.body;
    const sectionId = req.body.sectionId;

    // 2. Validation: Check if mandatory IDs are present
    if (!subSectionId || !sectionId || !courseId) {
      return res.status(404).json({
        success: false,
        message: "all fields are required (subSectionId, sectionId, courseId)",
      });
    }

    // 3. Optional validation (redundant checks retained from original code)
    const ifsubSection = await SubSection.findById({ _id: subSectionId });
    const ifsection = await Section.findById({ _id: sectionId });
    if (!ifsubSection || !ifsection) {
      return res.status(404).json({
        success: false,
        message: "Sub-section or Section not found",
      });
    }

    // 4. Delete the SubSection document
    await SubSection.findByIdAndDelete(subSectionId);

    // 5. Update the parent Section: Pull (remove) the SubSection ID from the 'subSection' array
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $pull: { subSection: subSectionId } },
      { new: true }
    );

    // 6. Fetch the fully populated Course structure (Section -> SubSection)
    const updatedCourse = await Course.findById(courseId)
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .exec();

    // 7. Return the fully updated course
    return res
      .status(200)
      .json({
        success: true,
        message: "Sub-section deleted",
        data: updatedCourse,
      });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error deleting sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: Could not delete sub-section.",
      error: error.message,
    });
  }
};
