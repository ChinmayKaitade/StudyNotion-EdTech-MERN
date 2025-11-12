const express = require("express");
const router = express.Router();

const { auth, isInstructor } = require("../middlewares/auth");

// controllers
const {
  updateProfile,
  updateUserProfileImage,
  getUserDetails,
  getEnrolledCourses,
  deleteAccount,
  instructorDashboard,
} = require("../controllers/Profile");

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

// Delete User Account
router.delete("/deleteProfile", auth, deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getUserDetails);

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

// update profile image
router.put("/updateUserProfileImage", auth, updateUserProfileImage);

// instructor Dashboard Details
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
