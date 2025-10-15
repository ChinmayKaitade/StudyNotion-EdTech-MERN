const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
// NOTE: Assuming the Cloudinary upload utility is imported here
const { uploadImageToCloudinary } = require("../utils/imageUploader");

/**
 * @async
 * @function createSubSection
 * @description Controller function for creating a new SubSection (lesson/video) within a Section.
 * This function handles file upload (video), document creation, and updating the parent Section.
 * NOTE: This route should be protected by 'auth' and 'isInstructor' middleware.
 * @param {object} req - Express request object (expects details in req.body and videoFile in req.files).
 * @param {object} res - Express response object.
 */
exports.createSubSection = async (req, res) => {
  try {
    // 1. Extract necessary data
    const { sectionId, title, timeDuration, description } = req.body; // Get the video file from the request files object

    const video = req.files.videoFile; // 2. Validation: Check if all mandatory fields are present

    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required (sectionId, title, duration, description, videoFile)",
      });
    } // 3. Upload the video file to Cloudinary

    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME // Upload the video to a specified folder
    ); // 4. Create the new SubSection document

    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url, // Store the secure URL from Cloudinary
    }); // 5. Update the parent Section document // Find the section by ID and push the new SubSection's ID into its 'subSection' array

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: subSectionDetails._id } }, // Add the reference
      { new: true } // Return the updated Section document
    ); // NOTE: To fully return the updated course structure to the frontend, // the 'updatedSection' should be populated with its 'subSection' references // before being sent back (e.g., .populate("subSection")).
    //? HW: Log Updated Section here, after adding populate query // 6. Return success response

    return res.status(200).json({
      success: true,
      message: "SubSection Created Successfully!👍",
      updatedSection, // Return the updated Section document
    });
  } catch (error) {
    // 7. Handle server or database errors
    console.error("Error creating sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error😥: Could not create sub-section.",
      error: error.message,
    });
  }
};


