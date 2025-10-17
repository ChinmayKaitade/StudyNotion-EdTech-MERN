const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader"); // Assuming this utility exists

// --------------------------------------------------------------------------------
// ✏️ UPDATE PROFILE (User Details & Additional Details)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function updateProfile
 * @description Updates both the core User document (firstName, lastName) and the linked
 * Profile document (gender, DOB, contact, about).
 * NOTE: This route must be protected by the 'auth' middleware.
 * @param {object} req - Express request object (expects profile/user details in req.body, user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.updateProfile = async (req, res) => {
  try {
    // 1. Destructure data from the request body
    const {
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      firstName,
      lastName,
      gender = "",
    } = req.body;
    const id = req.user.id;

    // 2. Find the profile documents
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    // NOTE: Optional validation for contactNumber/gender can be added here.

    // 3. Update the fields using logical OR for partial updates
    // Update User fields
    userDetails.firstName = firstName || userDetails.firstName;
    userDetails.lastName = lastName || userDetails.lastName;

    // Update Profile fields
    profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
    profile.about = about || profile.about;
    profile.gender = gender || profile.gender;
    profile.contactNumber = contactNumber || profile.contactNumber;

    // 4. Save both updated documents
    await profile.save();
    await userDetails.save();

    // 5. Return success response
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!👍",
      profile,
      userDetails,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Could not update profile.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// ❌ DELETE ACCOUNT
// --------------------------------------------------------------------------------

/**
 * @async
 * @function deleteProfile
 * @description Permanently deletes the user account and performs critical cleanup (Profile, Course enrollments).
 * NOTE: This route must be protected by the 'auth' and likely the 'isDemo' middleware.
 * @param {object} req - Express request object (expects user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.deleteProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 1. Delete the associated Profile
    await Profile.findByIdAndDelete({ _id: user.additionalDetails });

    // 2. Resolve TODO: Unenroll User From All the Enrolled Courses
    for (const courseId of user.courses) {
      // Find each course and remove the user's ID from the 'studentsEnrolled' array
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: id } },
        { new: true }
      );
    }

    // 3. Delete the User document
    await User.findByIdAndDelete({ _id: id });

    res.status(200).json({
      success: true,
      message: "User deleted successfully!👍 All associated data cleaned up.",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "User Cannot be deleted successfully",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🔍 GET ALL USER DETAILS (Core Profile Fetch)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function getAllUserDetails
 * @description Fetches the core User document and populates the linked Profile document.
 * @param {object} req - Express request object (expects user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    // Fetch User and populate their additionalDetails (Profile)
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    res.status(200).json({
      success: true,
      message: "User Data fetched successfully!👍",
      data: userDetails,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Could not fetch user data.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🎒 GET ENROLLED COURSES (Student View)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function getEnrolledCourses
 * @description Fetches all courses a student is currently enrolled in, along with their progress.
 * The query performs deep population to provide the entire course content structure.
 * @param {object} req - Express request object (expects user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.getEnrolledCourses = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch User and deeply populate their enrolled courses and progress
    const enrolledCourses = await User.findById(id)
      .populate({
        path: "courses",
        // Deep population for course content: Section -> SubSection
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .populate("courseProgress")
      .exec();

    res.status(200).json({
      success: true,
      message: "Enrolled courses fetched successfully!👍",
      data: enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Could not fetch enrolled courses.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🖼️ UPDATE DISPLAY PICTURE (Avatar)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function updateDisplayPicture
 * @description Handles the upload of a new profile picture (pfp) to Cloudinary and updates the User document.
 * @param {object} req - Express request object (expects image file 'pfp' in req.files, user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.updateDisplayPicture = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const image = req.files.displayPicture;

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image file (displayPicture) not found in request",
      });
    }

    // Upload the image to Cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      image,
      process.env.FOLDER_NAME // Assuming FOLDER_NAME is the upload folder
    );

    // Update the User document with the new image URL
    const updatedImage = await User.findByIdAndUpdate(
      { _id: id },
      { image: uploadDetails.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully!🖼️",
      data: updatedImage,
    });
  } catch (error) {
    console.error("Error updating display picture:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Could not update display picture.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 📊 INSTRUCTOR DASHBOARD
// --------------------------------------------------------------------------------

/**
 * @async
 * @function instructorDashboard
 * @description Fetches performance metrics for an instructor's courses (total students, total revenue).
 * NOTE: This route must be protected by 'auth' and 'isInstructor' middleware.
 * @param {object} req - Express request object (expects user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.instructorDashboard = async (req, res) => {
  try {
    const id = req.user.id;

    // Find all courses created by the instructor
    const courseData = await Course.find({ instructor: id });

    // Calculate metrics for each course
    const courseDetails = courseData.map((course) => {
      const totalStudents = course?.studentsEnrolled?.length || 0;
      // Revenue is calculated by multiplying price by the number of enrolled students
      const totalRevenue = course?.price * totalStudents;

      const courseStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudents,
        totalRevenue,
      };
      return courseStats;
    });

    res.status(200).json({
      success: true,
      message: "Instructor dashboard data fetched successfully!📈",
      data: courseDetails,
    });
  } catch (error) {
    console.error("Error fetching instructor dashboard:", error);
    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error: Could not fetch instructor dashboard data.",
      error: error.message,
    });
  }
};
