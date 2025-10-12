const Tag = require("../models/Tags"); // Import the Mongoose model for course Tags

/**
 * @async
 * @function createTag
 * @description Controller function to handle the creation of a new course Tag (category).
 * This operation is typically restricted to Admin or Instructor users via preceding middleware.
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

    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });
    console.log(tagDetails); // Log the newly created tag document // 4. Return success response

    return res.status(200).json({
      success: true,
      message: "Tag Created Successfully!👍",
      data: tagDetails, // Optionally return the created tag details
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
