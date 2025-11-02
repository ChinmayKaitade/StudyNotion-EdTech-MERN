const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User"); // User model is imported but not strictly used in this middleware

// --------------------------------------------------------------------------------
// 🔑 AUTHENTICATION MIDDLEWARE
// --------------------------------------------------------------------------------

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
    let token = null;
    
    // Check for token in cookies (primary method for web apps)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Check for token in request body
    else if (req.body && req.body.token) {
      token = req.body.token;
    }
    // Check for token in Authorization header (common for APIs)
    else if (req.header("Authorization")) {
      const authHeader = req.header("Authorization");
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "");
      }
    }

    // 2. Check if the token exists
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
      console.log(decode); // Log the decoded payload (user ID, email, role, etc.) 
      
      // 4. Attach the decoded payload to the request object 
      // This makes user information accessible in all subsequent middleware and controllers
      req.user = decode;
    } catch (error) {
      // Handle errors during token verification (e.g., token expired, invalid signature)
      return res.status(401).json({
        success: false,
        message: "Invalid Token!",
      });
    } 
    
    // 5. If the token is valid, move to the next handler/controller
    next();
  } catch (error) {
    // Handle unexpected errors during the process (e.g., failed to read header)
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

// --------------------------------------------------------------------------------
// 🛡️ AUTHORIZATION MIDDLEWARE (Role-Based Access Control)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function isStudent
 * @description Express middleware function to restrict route access to 'Student' users only.
 * It relies on the 'req.user' object being populated by a preceding authentication (JWT) middleware.
 * @param {object} req - Express request object (expects req.user to contain accountType).
 * @param {object} res - Express response object.
 * @param {function} next - Callback function to move to the next middleware or controller.
 */
exports.isStudent = async (req, res, next) => {
  try {
    // 1. Check the user's role/accountType extracted from the JWT payload
    // If the accountType is NOT "Student", access is denied.
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Students only",
      });
    } 
    
    // 2. If the user is a Student, allow them to proceed to the next handler
    next();
  } catch (error) {
    // Handle errors that might occur if req.user is missing or incomplete
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, Please try again",
    });
  }
};

/**
 * @async
 * @function isInstructor
 * @description Express middleware function to restrict route access to 'Instructor' users only.
 * It relies on the 'req.user' object being populated by a preceding authentication (JWT) middleware,
 * which decodes the user's role from the token payload.
 * @param {object} req - Express request object (expects req.user to contain accountType).
 * @param {object} res - Express response object.
 * @param {function} next - Callback function to move to the next middleware or controller.
 */
exports.isInstructor = async (req, res, next) => {
  try {
    // 1. Check the user's accountType extracted from the decoded JWT payload (req.user)
    // If the accountType is NOT "Instructor", access is denied.
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Instructor only",
      });
    } 
    
    // 2. If the user is an Instructor, allow them to proceed to the next handler/controller
    next();
  } catch (error) {
    // Handle errors that might occur if req.user is missing or the role field is corrupted
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, Please try again",
    });
  }
};

/**
 * @async
 * @function isAdmin
 * @description Express middleware function to restrict route access to 'Admin' users only.
 * It relies on the 'req.user' object being populated by a preceding authentication (JWT) middleware,
 * which decodes the user's accountType from the token payload.
 * @param {object} req - Express request object (expects req.user to contain accountType).
 * @param {object} res - Express response object.
 * @param {function} next - Callback function to move to the next middleware or controller.
 */
exports.isAdmin = async (req, res, next) => {
  try {
    // 1. Check the user's accountType extracted from the decoded JWT payload (req.user)
    // If the accountType is NOT "Admin", access is denied.
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    } 
    
    // 2. If the user is an Admin, allow them to proceed to the next handler/controller
    next();
  } catch (error) {
    // Handle errors that might occur if req.user is missing or the role field is corrupted
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, Please try again",
    });
  }
};