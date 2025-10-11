const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User"); // User model is imported but not strictly used in this middleware

/**
 * @async
 * @function auth
 * @description Express middleware function to verify user authentication using a JWT.
 * It ensures a valid token is present and injects the decoded user payload into the request object.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Callback function to move to the next middleware or controller.
 */
exports.auth = async (req, res, next) => {
  try {
    // 1. Extract the token from multiple possible locations:
    const token =
      req.cookies.token || // Check for token in cookies (primary method for web apps)
      req.body.token || // Check for token in request body
      req.header("Authorization").replace("Bearer ", ""); // Check for token in Authorization header (common for APIs) // 2. Check if the token exists

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing!😥",
      });
    }

    try {
      // 3. Verify the token
      // This synchronously verifies the signature using the secret key and checks expiration
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode); // Log the decoded payload (user ID, email, role, etc.) // 4. Attach the decoded payload to the request object // This makes user information accessible in all subsequent middleware and controllers

      req.user = decode;
    } catch (error) {
      // Handle errors during token verification (e.g., token expired, invalid signature)
      return res.status(401).json({
        success: false,
        message: "Invalid Token!",
      });
    } // 5. If the token is valid, move to the next handler/controller

    next();
  } catch (error) {
    // Handle unexpected errors during the process (e.g., failed to read header)
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

// isStudent

// isInstructor

// isAdmin
