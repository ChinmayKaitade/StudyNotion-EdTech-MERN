const { instance } = require("../config/razorpay"); // Import the configured Razorpay instance
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { paymentSuccess } = require("../mail/templates/paymentSuccess"); // Assuming paymentSuccess email template exists
const mongoose = require("mongoose"); // Used for ObjectId conversion
const crypto = require("crypto"); // Used for HMAC verification in verifySignature
const CourseProgress = require("../models/CourseProgress"); // Assuming CourseProgress model exists

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
 * @function enrolleStudent
 * @description Helper function to fulfill enrollment after successful payment verification.
 * @param {string} courseId - ID of the course to enroll the user in.
 * @param {string} userId - ID of the user to be enrolled.
 * @param {string} paymentId - The Razorpay payment ID.
 * @param {string} orderId - The Razorpay order ID.
 * @returns {Promise<void>}
 */
const enrolleStudent = async (courseId, userId) => {
  try {
    // 1. Update the Course: Add user to studentsEnrolled array
    const enrolledCourse = await Course.findOneAndUpdate(
      courseId,
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    // 2. Update the User: Add course to the user's courses array
    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      { $push: { courses: courseId } },
      { new: true }
    );

    // 3. Set Course Progress: Create a new CourseProgress document
    const newCourseProgress = new CourseProgress({
      userID: userId,
      courseID: courseId,
    });
    await newCourseProgress.save();

    // 4. Update the User: Add CourseProgress ID to user's courseProgress array
    await User.findByIdAndUpdate(
      userId,
      {
        $push: { courseProgress: newCourseProgress._id },
      },
      { new: true }
    );

    // 5. Send enrollment email
    const courseName = enrolledCourse.courseName;
    const courseDescription = enrolledCourse.courseDescription;
    const thumbnail = enrolledCourse.thumbnail;
    const userEmail = enrolledStudent.email;
    const userName = enrolledStudent.firstName + " " + enrolledStudent.lastName;

    const emailTemplate = courseEnrollmentEmail(
      courseName,
      userName,
      courseDescription,
      thumbnail
    );
    await mailSender(
      userEmail,
      `You have successfully enrolled for ${courseName}`,
      emailTemplate
    );
  } catch (error) {
    console.error("Error during student enrollment:", error);
    throw error;
  }
};

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
      // 5. Fulfill the enrollment action
      await enrolleStudent(courseId, userId); // 6. Important: Webhook response must be 200/OK to prevent Razorpay retries

      return res.status(200).json({
        success: true,
        message: "Signature verified and Course added successfully.",
      });
    } catch (error) {
      // Handle errors during enrollment or DB update
      console.error("Error during enrollment process:", error);
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

// --------------------------------------------------------------------------------
// 📧 SEND PAYMENT SUCCESS EMAIL (Confirmation Email Utility)
// --------------------------------------------------------------------------------

/**
 * @async
 * @function sendPaymentSuccessEmail
 * @description Sends a final payment confirmation email to the user with transaction details.
 * This is typically called by the frontend after receiving a successful payment response.
 * @param {object} req - Express request object (expects amount, paymentId, orderId in req.body, userId in req.user.id).
 * @param {object} res - Express response object.
 */
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { amount, paymentId, orderId } = req.body;
  const userId = req.user.id; // 1. Validation

  if (!amount || !paymentId) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid payment details",
    });
  }

  try {
    // 2. Find student details for email personalization
    const enrolledStudent = await User.findById(userId); // 3. Send email using the imported template

    await mailSender(
      enrolledStudent.email,
      `Study Notion Payment Successful!`,
      paymentSuccess(
        amount / 100, // Convert amount from paise to rupees
        paymentId,
        orderId,
        enrolledStudent.firstName,
        enrolledStudent.lastName
      )
    ); // 4. Return success response

    return res.status(200).json({
      success: true,
      message: "Payment success email sent successfully.",
    });
  } catch (error) {
    console.error("Error sending payment success email:", error);
    return res.status(500).json({
      success: false,
      message: `Error sending payment success email: ${error.message}`,
    });
  }
};
