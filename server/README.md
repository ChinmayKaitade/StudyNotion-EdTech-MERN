# 🎓 StudyNotion Backend

## 🚀 Overview

**StudyNotion** is a fully functional **EdTech platform** that enables users to **create, consume, and rate** educational content.  
This repository contains the **backend** codebase for the StudyNotion platform — built with the **MERN Stack** (MongoDB, ExpressJS, ReactJS, and NodeJS).

The backend handles **authentication, course management, payments, reviews, and more**, ensuring a seamless and secure experience for learners and instructors. ⚡

---

## 🏗️ Tech Stack

| Technology        | Description                                         |
| ----------------- | --------------------------------------------------- |
| 🟢 **Node.js**    | JavaScript runtime for scalable backend development |
| ⚙️ **Express.js** | Web framework for building RESTful APIs             |
| 🗄️ **MongoDB**    | NoSQL database for storing user and course data     |
| 🔐 **JWT**        | Secure authentication mechanism                     |
| 📧 **Nodemailer** | Email notifications and OTP verification            |
| 💰 **Razorpay**   | Payment gateway integration                         |
| ☁️ **Cloudinary** | Media storage for images and videos                 |
| 🛠️ **dotenv**     | Environment variable management                     |

---

## 🧩 Features

✅ User Authentication (Signup / Login / OTP Verification)  
✅ Role-based Access Control (Student / Instructor / Admin)  
✅ Course Creation, Update, and Management  
✅ Rating & Review System  
✅ Payment Integration with Razorpay  
✅ Cloudinary for File Uploads (Images / Videos)  
✅ Mail Notifications for OTP & Payment Confirmation  
✅ Secure REST APIs with Express Middleware  
✅ Error Handling and Validation

---

## 📁 Folder Structure

```
StudyNotion-Backend/
│
├── config/             # Database and environment configurations
├── controllers/        # Logic for routes (auth, courses, payments, etc.)
├── mail/               # Email templates and configurations
├── middlewares/        # Authentication and validation middlewares
├── models/             # MongoDB models (User, Course, Rating, etc.)
├── routes/             # All API route definitions
├── utils/              # Helper functions
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── server.js           # Entry point of the backend
```

---

## ⚙️ Installation & Setup

Follow these steps to set up the backend locally 👇

### 1️⃣ Clone the repository

```bash
git clone https://github.com/ChinmayKaitade/StudyNotion-EdTech-MERN
cd server
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file in the root directory

```bash
PORT=4000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAIL_HOST=smtp.yourmail.com
MAIL_USER=your_email
MAIL_PASS=your_password
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
```

### 4️⃣ Start the server

```bash
npm run dev
```

The backend will start on 👉 **[http://localhost:4000](http://localhost:4000)**

---

## 🧪 API Documentation

📄 Full API documentation is available here:
👉 [Postman Documentation](https://documenter.getpostman.com/view/33792038/2sB3Wttz7C)

---

## 🔒 Environment Variables

| Variable       | Description                       |
| -------------- | --------------------------------- |
| `PORT`         | Server running port               |
| `MONGODB_URL`  | MongoDB connection string         |
| `JWT_SECRET`   | JWT secret key for authentication |
| `CLOUDINARY_*` | Cloudinary credentials            |
| `MAIL_*`       | Email service credentials         |
| `RAZORPAY_*`   | Razorpay payment keys             |

---

## 🧠 Future Enhancements

- ✨ Admin dashboard for analytics and user management
- 📱 Push notifications for students and instructors
- 🧾 Advanced reporting and insights
- 🎥 Live class integration

---

## 🤝 Contributing

Contributions are welcome!
If you’d like to improve the project, please **fork** the repository and create a **pull request**. 🙌

---

## 🧑‍💻 Author

**Chinmay Kaitade**
💼 _Full Stack Developer | MERN Stack Enthusiast_
🔗 [GitHub](https://github.com/ChinmayKaitade) | [LinkedIn](https://linkedin.com/in/chinmay-sharad-kaitade)

---

## ⭐ Support

If you find this project helpful, please give it a **⭐ star** on GitHub — it motivates me to keep improving the project! 💙
