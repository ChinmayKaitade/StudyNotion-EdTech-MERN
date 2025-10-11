const mongoose = require("mongoose");

/**
 * @typedef TagsSchema
 * @description Defines the Mongoose Schema for the Tag model.
 * This schema is used for categorizing courses, allowing for easy filtering and discovery.
 */
const tagsSchema = new mongoose.Schema({
  // The name of the tag (e.g., "Web Development", "Data Science"). Required field.
  name: {
    type: String,
    required: true,
  }, // A brief description explaining what this category/tag represents. (optional)
  description: {
    type: String,
  }, // Reference to the Course model. // NOTE: This field is typically used to hold an array of course IDs (courses: [{ type: ObjectId, ref: "Course" }]) // to track all courses associated with this tag. As structured, it only references one course.
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // Links to the Course model
  },
});

// Export the Mongoose model named 'Tag' based on the defined schema.
module.exports = mongoose.model("Tag", tagsSchema);
