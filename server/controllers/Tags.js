const Tag = require("../models/Tags"); // Import the Mongoose model for course Tags

// --------------------------------------------------------------------------------
// ➕ CREATE TAG
// --------------------------------------------------------------------------------

/**
 * @async
 * @function createTag
 * @description Controller function to handle the creation of a new course Tag (category).
 * It validates required fields and persists the new Tag document to the database.
 * NOTE: This route should be protected by isAdmin or isInstructor middleware.
 * @param {object} req - Express request object (expects 'name' and 'description' in req.body).
 * @param {object} res - Express response object.
 */
exports.createTag = async (req, res) => {
  try {
    // 1. Extract name and description from the request body
    const { name, description } = req.body; // 2. Validation: Check if mandatory fields are missing

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name and description)",
      });
    } // 3. Create the new Tag document in the database

    // NOTE: A check for whether a Tag with this 'name' already exists would be highly recommended here.

    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });
    console.log(tagDetails); // 4. Return success response

    return res.status(200).json({
      success: true,
      message: "Tag Created Successfully!👍",
      data: tagDetails, // Return the created tag details
    });
  } catch (error) {
    // Handle server or database errors
    console.error("Error creating tag:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: Could not create tag.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🔍 SHOW ALL TAGS
// --------------------------------------------------------------------------------

/**
 * @async
 * @function showAllTags
 * @description Controller function to retrieve all existing course Tags (categories) from the database.
 * This function is used by the frontend (e.g., in the course catalog or filter menus).
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.showAllTags = async (req, res) => {
  try {
    // 1. Query the database to find all Tag documents
    // Projection { name: true, description: true } ensures only these fields are fetched, minimizing payload size.
    const allTags = await Tag.find({}, { name: true, description: true }); // 2. Return success response with the list of tags

    res.status(200).json({
      success: true,
      message: "All Tags returned Successfully!👍",
      allTags,
    });
  } catch (error) {
    // 3. Handle server or database errors
    console.error("Error fetching all tags:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: Could not retrieve tags.",
      error: error.message,
    });
  }
};
