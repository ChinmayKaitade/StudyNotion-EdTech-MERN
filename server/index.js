const express = require("express");

const app = express(); // Initialize the Express application

// Import route handlers
const userRoutes = require("./routes/User"); // Authentication and User routes
const paymentRoutes = require("./routes/Payments"); // Payment processing routes
const profileRoutes = require("./routes/Profile"); // User profile management routes
const CourseRoutes = require("./routes/Course"); // Course, Section, and Subsection management routes
const contactRoutes = require("./routes/ContactUs"); // Contact Us form submission route (manually added)

const database = require("./config/database"); // Utility to connect to MongoDB
const cookieParser = require("cookie-parser"); // Middleware to parse and set cookies

const cors = require("cors"); // Middleware for Cross-Origin Resource Sharing
const fileUpload = require("express-fileupload"); // Middleware for handling file uploads
const { cloudinaryConnect } = require("./config/cloudinary"); // Utility to connect to Cloudinary

const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 5000; // Define the server port (defaults to 5000 if not in .env)

// ----------------------------------------------------
// 💾 Database Connection
// ----------------------------------------------------
database.connect(); // Connects the application to the MongoDB database

// ----------------------------------------------------
// ⚙️ Middleware Setup
// ----------------------------------------------------
app.use(express.json()); // Body parser for incoming JSON data
app.use(cookieParser()); // Enables parsing of cookies from the incoming requests

// CORS Configuration: Allows the frontend to make requests to the backend
const whitelist = process.env.CORS_ORIGIN
  ? JSON.parse(process.env.CORS_ORIGIN)
  : ["*"]; // Allows all origins by default if CORS_ORIGIN is not set

app.use(
  cors({
    origin: whitelist, // Allowed origins for the frontend
    credentials: true, // Crucial for sending JWTs via HTTP-only cookies
    maxAge: 14400, // Caches preflight requests for 4 hours (improves performance)
  })
);

// File Upload Middleware: Used to save files temporarily before uploading to Cloudinary
app.use(
  fileUpload({
    useTempFiles: true, // Use temporary files on the disk
    tempFileDir: "/tmp", // Specify the directory for temporary file storage
  })
);

// ----------------------------------------------------
// ☁️ Cloudinary Connection
// ----------------------------------------------------
cloudinaryConnect(); // Initialize connection to the Cloudinary service

// ----------------------------------------------------
// 🛣️ Route Mounting
// ----------------------------------------------------
// Mount the main API routes with a common base prefix /api/v1
app.use("/api/v1/auth", userRoutes); // User authentication routes
app.use("/api/v1/payment", paymentRoutes); // Payment processing routes
app.use("/api/v1/profile", profileRoutes); // User profile routes
app.use("/api/v1/course", CourseRoutes); // Course and content routes
app.use("/api/v1/contact", require("./routes/ContactUs")); // Contact Us form route

// Default Route (Server Health Check)
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the StudyNotion API! Server is operational. ",
  });
});

// ----------------------------------------------------
// 🚀 Start the Server
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
