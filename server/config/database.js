const mongoose = require("mongoose");
// Load environment variables from a .env file into process.env
require("dotenv").config();

/**
 * @function connect
 * @description Establishes the initial connection to the MongoDB database using Mongoose.
 * It retrieves the connection string from the MONGODB_URL environment variable.
 */
exports.connect = () => {
  // Attempt to connect to the MongoDB database
  mongoose
    .connect(process.env.MONGODB_URL, {
      // These options are now largely deprecated but traditionally
      // ensure compatibility with the MongoDB driver's new URL parser and topology engine.
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }) // Success handler: executed if the connection is successful
    .then(() => console.log("DB Connected Successfully!👍")) // Error handler: executed if connection fails (e.g., incorrect URL, network issue)
    .catch((error) => {
      console.log("DB Connection Failed!😓");
      console.error(error); // Exit the process with a failure code (1) to indicate a critical setup failure
      process.exit(1);
    });
};
