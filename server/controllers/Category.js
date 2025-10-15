const Category = require("../models/Category");
const Course = require("../models/Course");

// --------------------------------------------------------------------------------
// ➕ CREATE CATEGORY
// --------------------------------------------------------------------------------

/**
 * @async
 * @function createCategory
 * @description Controller function to handle the creation of a new course category.
 * NOTE: This route should typically be restricted to Admin users via preceding middleware.
 * @param {object} req - Express request object (expects 'name' and 'description' in req.body).
 * @param {object} res - Express response object.
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body; // 1. Validation: Check if the mandatory field 'name' is present
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    } // 2. Create the new Category document in the database
    const CategorysDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(CategorysDetails); // 3. Return success response
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
      data: CategorysDetails, // Include the created category details
    });
  } catch (error) {
    // Handle server/database errors
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Could not create category.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🔍 SHOW ALL CATEGORIES
// --------------------------------------------------------------------------------

/**
 * @async
 * @function showAllCategories
 * @description Controller function to retrieve all existing categories.
 * This is used for generating the category menu or filtering options.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.showAllCategories = async (req, res) => {
  try {
    // 1. Query the database to find all Category documents
    // Projection { name: true, description: true } fetches minimal necessary fields.
    const allCategorys = await Category.find(
      {},
      { name: true, description: true }
    ); // 2. Return success response with the list of categories
    res.status(200).json({
      success: true,
      data: allCategorys,
    });
  } catch (error) {
    // Handle server/database errors
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Could not fetch categories.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 💡 CATEGORY PAGE DETAILS (Catalog View)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function categoryPageDetails
 * @description Controller function to fetch aggregated course data for a specific category page.
 * It fetches: 1) Courses in the selected category, 2) Courses from other categories, 3) Top-selling courses globally.
 * @param {object} req - Express request object (expects 'categoryId' in req.body).
 * @param {object} res - Express response object.
 */
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body; // 1. Get courses for the specified category

    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" }, // Only show published courses
        populate: [{ path: "instructor" }, { path: "ratingAndReviews" }], // Deeply populate related data for each course
      })
      .exec(); // Handle the case when the category is not found
    if (!selectedCategory) {
      console.log("Category not found.");
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    } // Extract the list of courses for the selected category

    const selectedCourses = selectedCategory.courses;

    // NOTE: This logic handles the case where the category is found but has no courses.
    if (selectedCourses.length === 0) {
      console.log("No courses found for the selected category.");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    } // 2. Get courses for other categories (for recommendations/discoverability)

    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId }, // Filter: where ID is NOT the selected category ID
    }).populate({
      path: "courses",
      match: { status: "Published" },
      populate: [{ path: "instructor" }, { path: "ratingAndReviews" }],
    }); // Aggregate all courses from the "other" categories into a single array

    let differentCourses = [];
    for (const category of categoriesExceptSelected) {
      differentCourses.push(...category.courses);
    } // 3. Get top-selling courses across all categories (for generic recommendations)

    const allCategories = await Category.find().populate({
      path: "courses",
      match: { status: "Published" },
      populate: [{ path: "instructor" }, { path: "ratingAndReviews" }],
    }); // Flatten all courses from all categories into one array

    const allCourses = allCategories.flatMap((category) => category.courses); // Sort by a 'sold' property (assumed to be in the Course model) and take the top 10

    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10); // 4. Return combined course data

    res.status(200).json({
      selectedCourses: selectedCourses, // Courses specific to the requested category
      differentCourses: differentCourses, // Courses from all other categories
      mostSellingCourses: mostSellingCourses, // Global top-selling courses
      success: true,
    });
  } catch (error) {
    // Handle server/database errors
    return res.status(500).json({
      success: false,
      message: "Internal server error: Could not fetch category page details.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🔗 ADD COURSE TO CATEGORY
// --------------------------------------------------------------------------------

/**
 * @async
 * @function addCourseToCategory
 * @description Controller function to associate an existing course with an existing category.
 * It validates both entities and pushes the course ID into the category's 'courses' array.
 * NOTE: This is typically called after a course is created or updated.
 * @param {object} req - Express request object (expects 'courseId' and 'categoryId' in req.body).
 * @param {object} res - Express response object.
 */
exports.addCourseToCategory = async (req, res) => {
  const { courseId, categoryId } = req.body;

  try {
    // 1. Find and validate Category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    } // 2. Find and validate Course

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    } // 3. Check for existing association (prevent duplicates)

    if (category.courses.includes(courseId)) {
      return res.status(200).json({
        success: true,
        message: "Course already exists in the category",
      });
    } // 4. Create the association (push course ID to category's array)

    category.courses.push(courseId);
    await category.save(); // 5. Return success

    return res.status(200).json({
      success: true,
      message: "Course added to category successfully",
    });
  } catch (error) {
    // Handle server/database errors
    return res.status(500).json({
      success: false,
      message: "Internal server error: Could not add course to category.",
      error: error.message,
    });
  }
};
