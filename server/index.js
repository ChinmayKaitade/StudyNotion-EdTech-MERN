const express = require("express");
const app = express();

// packages
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

// connection to DB and cloudinary
const { connectDB } = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");

// routes
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

// middleware
app.use(express.json()); // to parse json body
app.use(cookieParser());
app.use(
  cors({
    // origin: 'http://localhost:3000', // frontend link
    origin: "*",
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Started on PORT ${PORT}`);
});

// connections
connectDB();
cloudinaryConnect();

// mount route
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);

// Default Route
app.get("/", (req, res) => {
  // console.log('Your server is up and running..!');
  res.send(`<div>
    <h1>DEFAULT ROUTE</h1>  
    <p>StudyNotion is Live🔥 Everything is running OK 👍🚀</p>
    <p>Made By ❤️‍🔥 with Chinmay Kaitade</p>
    </div>`);
});
