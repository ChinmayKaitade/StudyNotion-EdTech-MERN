const mongoose = require("mongoose");

/**
 * @typedef CategorySchema
 * @description Defines the Mongoose Schema for the **Category** model.
 * This model is used for broad classification of courses (e.g., "Web Development", "Data Science").
 * It contains a list of references to all courses associated with it, enabling easy discovery and filtering
 * in the course catalog.
 */
const categorySchema = new mongoose.Schema({
  // Name of the category (e.g., "Web Development", "Finance"). Required field.
  name: {
    type: String,
    required: true,
  }, // A brief description of what courses in this category cover. (optional)
  description: {
    type: String,
  }, // Array of references to the Course model, tracking all courses associated with this category.
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId, // Links to the Course model. // NOTE: Conventionally, this ref name should match the model name "Course".
      ref: "Course",
    },
  ],
});

// Export the Mongoose model named 'Category' based on the defined schema.
module.exports = mongoose.model("Category", categorySchema);
