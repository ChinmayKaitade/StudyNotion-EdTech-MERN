// Import the required modules
const express = require("express");
const router = express.Router();

// Import all Controllers
const {
  // Course Controllers
  createCourse,
  getAllCourses,
  getCourseDetails,
  getInstructorCourses,
  editCourse,
  getFullCourseDetails,
  deleteCourse,
  searchCourse,
  markLectureAsComplete,
} = require("../controllers/Course");

const {
  // Categories Controllers
  showAllCategories,
  createCategory,
  categoryPageDetails,
  addCourseToCategory,
} = require("../controllers/Category");

const {
  // Sections Controllers
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

const {
  // Sub-Sections Controllers
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection");

const {
  // Rating Controllers
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview");

// Importing Middlewares
const { isDemo } = require("../middlewares/demo");
const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/auth");

// ********************************************************************************************************
// 📚 Course Routes (Instructor Access)
// ********************************************************************************************************

// Route for Instructors to Create a New Course
// Protected by Auth, Instructor Role, and Demo Restriction
router.post("/createCourse", auth, isInstructor, isDemo, createCourse);

// Route for Instructors to Edit an Existing Course
router.post("/editCourse", auth, isInstructor, isDemo, editCourse);

// Route for Instructors to Delete a Course
router.delete("/deleteCourse", auth, isDemo, deleteCourse);

// Route to get all Courses created by the authenticated Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);

// Route for Students/Public to retrieve all Courses (Catalog View)
router.get("/getAllCourses", getAllCourses);

// Route for Students/Public to get detailed information for a single course
router.post("/getCourseDetails", getCourseDetails);

// Route to get all course details including progress (requires auth for student progress tracking)
router.post("/getFullCourseDetails", auth, getFullCourseDetails);

// Route to search courses (Public access)
router.post("/searchCourse", searchCourse);

// Route for Students to mark a lecture/sub-section as complete
router.post("/updateCourseProgress", auth, isStudent, markLectureAsComplete);

// ********************************************************************************************************
// 🧩 Section and Sub-Section Routes (Instructor Access)
// ********************************************************************************************************

// Section Management
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, isDemo, deleteSection); // Demo restricted

// Sub-Section Management
router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

// ********************************************************************************************************
// 🏷️ Category Routes (Admin Access)
// ********************************************************************************************************

// Route for Admin to Create a new Category
router.post("/createCategory", auth, isAdmin, createCategory); // Protected by Admin role

// Route to get all Categories (Public access for filtering)
router.get("/showAllCategories", showAllCategories);

// Route to get course data specific to a category page (Public access)
router.post("/getCategoryPageDetails", categoryPageDetails);

// Route to link a Course to a Category (Typically used during Course Creation/Edit)
router.post("/addCourseToCategory", auth, isInstructor, addCourseToCategory);

// ********************************************************************************************************
// ⭐ Rating and Review Routes (Student Access)
// ********************************************************************************************************

// Route for Students to submit a rating and review
router.post("/createRating", auth, isStudent, isDemo, createRating); // Protected by Auth, Student Role, and Demo Restriction

// Route to get the calculated average rating for a specific course (Public access)
router.get("/getAverageRating", getAverageRating);

// Route to get all reviews globally (Public access, often used on a dedicated review page)
router.get("/getReviews", getAllRating);

// Export the router for use in the main application
module.exports = router;
