// ===============================
// 🔐 AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ===============================

const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ======================================================
   🧩 1. AUTH MIDDLEWARE — Verify JWT Token
   ====================================================== */
exports.auth = (req, res, next) => {
  try {
    // ✅ Extract token from body, cookies, or headers
    const token =
      req.body?.token ||
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied: Token is missing",
      });
    }

    // ✅ Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // attach decoded user data to request
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: err.message,
      });
    }

    // ✅ Proceed to next middleware
    next();
  } catch (error) {
    console.error("❌ Error during token validation:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
      error: error.message,
    });
  }
};

/* ======================================================
   🧩 2. ROLE-BASED ACCESS CONTROL (RBAC)
   ====================================================== */

// 🔸 Generic role validator
const authorizeRole = (role) => {
  return (req, res, next) => {
    try {
      if (req.user?.accountType !== role) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Only ${role}s can access this route`,
        });
      }
      next();
    } catch (error) {
      console.error(`❌ Error while checking ${role} access:`, error);
      return res.status(500).json({
        success: false,
        message: `Error while checking ${role} access`,
        error: error.message,
      });
    }
  };
};

// ✅ Export specific role-based middlewares
exports.isStudent = authorizeRole("Student");
exports.isInstructor = authorizeRole("Instructor");
exports.isAdmin = authorizeRole("Admin");
