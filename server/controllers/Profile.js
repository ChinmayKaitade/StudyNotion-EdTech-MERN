const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course"); // Required for the deleteProfile cleanup step

// --------------------------------------------------------------------------------
// ✏️ UPDATE PROFILE
// --------------------------------------------------------------------------------

/**
 * @async
 * @function updateProfile
 * @description Controller function to update a logged-in user's additional profile details.
 * It retrieves the Profile ID from the User document and updates the corresponding Profile document fields (gender, DOB, contact, about).
 * NOTE: This route must be protected by the 'auth' middleware.
 * @param {object} req - Express request object (expects profile fields in req.body, and user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.updateProfile = async (req, res) => {
  try {
    // 1. Extract data from the request body
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body; // 2. Get user ID from the authenticated request

    const id = req.user.id; // 3. Validation: Check for mandatory fields

    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message:
          "Contact Number and Gender are required fields for the profile.",
      });
    } // 4. Find the User document to get the associated Profile ID

    const userDetails = await User.findById(id); // 5. Retrieve the Profile document using the linked ID

    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId); // 6. Update the fields on the in-memory Profile object

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber; // 7. Save the updated Profile document to the database

    await profileDetails.save(); // 8. Return success response

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

// --------------------------------------------------------------------------------
// ❌ DELETE PROFILE (ACCOUNT DELETION)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function deleteProfile
 * @description Controller function to permanently delete a user account and all associated data.
 * It performs critical cleanup: deletes the Profile, removes the user from all enrolled courses,
 * and finally deletes the User document.
 * NOTE: This route must be protected by the 'auth' middleware.
 * @param {object} req - Express request object (expects user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.deleteProfile = async (req, res) => {
  try {
    // 1. Get user ID from the authenticated request
    const id = req.user.id; // 2. Find the user and validate existence

    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User Not Found!😥",
      });
    } // 3. Delete the associated Profile document

    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails }); // 4. Cleanup Step: Un-enroll user from all enrolled courses // Loop through the array of course IDs the user is enrolled in

    for (const courseId of userDetails.courses) {
      // Find each course and remove the user's ID from the 'studentsEnrolled' array
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: id } }, // $pull removes the element matching the ID
        { new: true }
      );
    } // 5. Delete the User document

    await User.findByIdAndDelete({ _id: id }); // 6. Return success response

    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully!👍 All associated data cleaned up.",
    });
  } catch (error) {
    // 7. Handle server or database errors
    console.error("Error deleting profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error😥: Could not delete profile details.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🔍 GET ALL USER DETAILS
// --------------------------------------------------------------------------------

/**
 * @async
 * @function getAllUserDetails
 * @description Controller function to fetch the complete details of the authenticated user.
 * It uses the user ID from the JWT payload and populates the linked 'additionalDetails' (Profile).
 * NOTE: This route must be protected by the 'auth' middleware.
 * @param {object} req - Express request object (expects user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.getAllUserDetails = async (req, res) => {
  try {
    // 1. Get user ID from the authenticated request
    const id = req.user.id; // 2. Fetch user details and populate the linked Profile document

    const userDetails = await User.findById(id)
      .populate("additionalDetails") // Replace the Profile ID with the actual Profile document data
      .exec(); // 3. Check if user details were successfully fetched

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User details not found.",
      });
    } // 4. Return success response with the fetched data

    return res.status(200).json({
      success: true,
      message: "User Data Fetched Successfully!👍",
      data: userDetails, // Include the fetched and populated user details
    });
  } catch (error) {
    // 5. Handle server or database errors
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Could not fetch user data.",
      error: error.message,
    });
  }
};
