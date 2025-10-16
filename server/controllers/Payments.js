const { instance } = require("../config/razorpay"); // Import the configured Razorpay instance
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  // Import the HTML template for the enrollment confirmation email
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose"); // Used for ObjectId conversion
const crypto = require("crypto"); // Used for HMAC verification in verifySignature

// NOTE: This should be read from process.env in a production environment
const webhookSecret = "12345678";

// --------------------------------------------------------------------------------
// 💳 CAPTURE PAYMENT (Initiate Order)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function capturePayment
 * @description Controller function to initiate a payment order with Razorpay for a single course enrollment.
 * It validates course existence and user enrollment status before creating the order.
 * NOTE: This route must be protected by the 'auth' middleware.
 * @param {object} req - Express request object (expects 'course_id' in req.body, user ID in req.user.id).
 * @param {object} res - Express response object.
 */
exports.capturePayment = async (req, res) => {
  const { course_id } = req.body;
  const userId = req.user.id; // User ID is extracted from the JWT payload

  try {
    // 1. Basic validation
    if (!course_id) {
      return res.json({
        success: false,
        message: "Please provide valid course ID",
      });
    }

    let course;
    try {
      // 2. Check if the course exists in the DB
      course = await Course.findById(course_id);

      if (!course) {
        return res.json({
          success: false,
          message: "Could not find the course",
        });
      } // 3. Check if the user is already enrolled

      const uid = new mongoose.Types.ObjectId(userId); // Convert userId string to Mongoose ObjectId
      if (course.studentsEnrolled.includes(uid)) {
        return res.status(200).json({
          success: false,
          message: "Student is already enrolled in this course.",
        });
      }
    } catch (error) {
      // Handle errors during DB lookup/validation
      console.error(error);
      return res.status(500).json({
        success: false,
        message: `Error during course validation: ${error.message}`,
      });
    } // 4. Prepare Razorpay order details

    const amount = course.price;
    const currency = "INR"; // Assuming payment is in Indian Rupees

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (cents)
      currency,
      receipt: Math.random(Date.now()).toString(), // Unique receipt identifier
      notes: {
        courseId: course_id, // Custom notes to link the payment to the order/user
        userId,
      },
    };

    try {
      // 5. Initiate the payment order using the Razorpay instance
      const paymentResponse = await instance.orders.create(options);
      console.log("Razorpay Order Created:", paymentResponse); // 6. Return the order details to the client (Frontend will use this to open the payment modal)

      return res.status(200).json({
        success: true,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id, // The ID of the order created by Razorpay
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      // Handle errors during Razorpay API call
      console.error("Error creating Razorpay order:", error);
      return res.status(500).json({
        success: false,
        message: `Could not initiate order. ${error.message}`,
      });
    }
  } catch (error) {
    // Handle general server errors
    console.error("General Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during payment initiation.",
      error: error.message,
    });
  }
};

// --------------------------------------------------------------------------------
// 🔒 VERIFY SIGNATURE (Webhook Handler)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function verifySignature
 * @description Controller function that acts as a webhook handler for Razorpay.
 * It verifies the authenticity of the payment data using the HMAC signature. If successful,
 * it enrolls the student in the course and sends a confirmation email.
 * @param {object} req - Express request object (contains payment payload in req.body and signature in req.headers).
 * @param {object} res - Express response object.
 */
exports.verifySignature = async (req, res) => {
  // 1. Extract the signature sent by Razorpay in the request header
  const signature = req.headers["x-razorpay-signature"]; // 2. Generate HMAC signature on the server side

  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex"); // 3. Compare the server-generated signature (digest) with the signature received from Razorpay

  if (signature === digest) {
    console.log("Payment is authorized: Signature successfully verified."); // 4. Extraction: Extract essential data (courseId and userId) from the payment notes

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      // 5. Enrollment Step A: Add user to the Course's 'studentsEnrolled' array
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } }, // Atomically push the user ID
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not found after payment. Enrollment failed.",
        });
      }

      console.log("Course Updated:", enrolledCourse); // 6. Enrollment Step B: Add course to the User's 'courses' array

      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } }, // Atomically push the course ID
        { new: true }
      );

      console.log("Student Updated:", enrolledStudent); // 7. Send enrollment confirmation email

      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations, from StudyNotion",
        "Congratulations, you are onboarded into new StudyNotion Course" // NOTE: Should use the imported HTML template here
      );

      console.log("Enrollment Email Sent:", emailResponse); // 8. Important: Webhook response must be 200/OK to prevent Razorpay retries

      return res.status(200).json({
        success: true,
        message: "Signature verified and Course added successfully.",
      });
    } catch (error) {
      // Handle errors during enrollment or DB update
      console.error("Error during enrollment process:", error); // Still return 500/error response, but note that the webhook might retry
      return res.status(500).json({
        success: false,
        message: `Enrollment processing failed: ${error.message}`,
      });
    }
  } else {
    // 3b. Signature verification failed
    return res.status(400).json({
      success: false,
      message: "Invalid Signature: Request unauthorized.",
    });
  }
};
