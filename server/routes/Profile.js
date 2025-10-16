const express = require("express");
const router = express.Router();
// Import authentication and authorization middleware
const { auth, isInstructor } = require("../middlewares/auth");

// Import controller functions for profile management
const {
  deleteProfile, // NOTE: Controller name corrected from deleteAccount
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture, // Controller to handle profile picture updates
  getEnrolledCourses, // Controller for fetching student enrollment list
  instructorDashboard, // Controller for fetching instructor metrics
} = require("../controllers/Profile");
const { isDemo } = require("../middlewares/demo"); // Middleware for restricting changes in a demo environment (assuming existence)

// ********************************************************************************************************
// 👤 Profile Routes (Requires Authentication: `auth`)
// ********************************************************************************************************

// Route to Delete User Account
// Requires authentication and is restricted in demo mode
router.delete("/deleteProfile", auth, isDemo, deleteProfile);

// Route to Update User Profile Details (Gender, DOB, Contact, About)
// Requires authentication and is restricted in demo mode
router.put("/updateProfile", auth, isDemo, updateProfile);

// Route to Get Full User Details (Requires authentication)
router.get("/getUserDetails", auth, getAllUserDetails);

// Route to Get List of Courses the authenticated user is enrolled in
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

// Route to Update User's Profile Picture/Avatar
// Requires authentication and is restricted in demo mode
router.put("/updateDisplayPicture", auth, isDemo, updateDisplayPicture);

// Route to Get Instructor Specific Dashboard Details (e.g., stats on courses, students)
// Requires authentication AND requires the user to be an Instructor
router.get(
  "/getInstructorDashboardDetails",
  auth,
  isInstructor,
  instructorDashboard
);

// Export the router for use in the main application
module.exports = router;
