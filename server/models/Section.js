const mongoose = require("mongoose");

/**
 * @typedef SectionSchema
 * @description Defines the Mongoose Schema for the Section model.
 * This represents a major module or chapter within a Course, and acts as a container
 * for individual SubSections (lessons/videos).
 */
const sectionSchema = new mongoose.Schema({
  // The name or title of the course section (e.g., "Introduction to React", "Advanced Concepts") (optional)
  sectionName: {
    type: String,
  }, // An array of references to the individual SubSection models contained within this Section.
  subSection: [
    {
      type: mongoose.Schema.Types.ObjectId, // Setting 'required: true' ensures a SubSection document must be referenced here, // though an empty array is still valid.
      required: true,
      ref: "SubSection", // Links to the SubSection model (individual videos/lessons)
    },
  ],
});

// Export the Mongoose model named 'Section' based on the defined schema.
module.exports = mongoose.model("Section", sectionSchema);
