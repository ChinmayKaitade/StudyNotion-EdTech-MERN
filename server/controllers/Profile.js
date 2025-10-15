const Profile = require("../models/Profile");
const User = require("../models/User");

/**
 * @async
 * @function updateProfile
 * @description Controller function to update a logged-in user's additional profile details.
 * It retrieves the Profile ID from the User document and updates the corresponding Profile document.
 * NOTE: This route must be protected by the 'auth' middleware.
 * @param {object} req - Express request object (expects dateOfBirth, about, contactNumber, gender in req.body, and user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.updateProfile = async (req, res) => {
  try {
    // 1. Extract data from the request body
    // Using default values for optional fields (dateOfBirth, about)
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    // 2. Get user ID from the authenticated request (injected by the 'auth' middleware)
    const id = req.user.id;

    // 3. Validation: Check for mandatory fields (ID is checked via 'auth' middleware,
    // but checking contactNumber and gender ensures data quality for the profile)
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message:
          "Contact Number and Gender are required fields for the profile.",
      });
    }

    // 4. Find the User document to get the associated Profile ID
    const userDetails = await User.findById(id);

    // 5. Retrieve the Profile document using the linked ID
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    // 6. Update the fields on the in-memory Profile object
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    // 7. Save the updated Profile document to the database
    await profileDetails.save();

    // 8. Return success response
    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully!👍",
      data: profileDetails, // Return the updated profile details
    });
  } catch (error) {
    // 9. Handle server or database errors
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error😥: Could not update profile details.",
      error: error.message,
    });
  }
};
