/**
 * @async
 * @function isDemo
 * @description Express middleware function to prevent specific demo accounts from performing
 * write operations (e.g., CREATE, UPDATE, DELETE).
 * It relies on the 'req.user' object being populated by the preceding 'auth' (JWT) middleware.
 * @param {object} req - Express request object (expects req.user to contain email).
 * @param {object} res - Express response object.
 * @param {function} next - Callback function to move to the next middleware or controller.
 */
exports.isDemo = async (req, res, next) => {
  // Log the email being checked (useful for debugging)
  console.log(`Checking Demo Status for email: ${req.user.email}`); // 1. Identify the demo users by their emails

  if (
    req.user.email === "kumarhimanshusangwan@gmail.com" ||
    req.user.email === "1234@gmail.com"
  ) {
    // 2. If the user is a demo account, block the request
    return res.status(401).json({
      success: false,
      message:
        "Access Denied: This is a Demo User. Modifications are restricted.",
    });
  } // 3. If the user is not a demo account, allow them to proceed

  next();
};
