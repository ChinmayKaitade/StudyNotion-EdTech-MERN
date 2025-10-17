# 🚀 StudyNotion: The MERN Stack Ed-Tech Platform

## 🌟 Empower Your Future with Coding Skills

StudyNotion is a fully functional, versatile, and intuitive educational technology (ed-tech) platform that enables users to create, consume, and rate educational content. Built with the **MERN Stack** (**ReactJS**, **NodeJS**, **MongoDB**, and **ExpressJS**), it offers a seamless and interactive learning experience for students while providing a robust global platform for instructors to share their expertise.

---

## ✨ Key Features

### For Students 🧑‍💻

- **Intuitive Course Catalog:** Users can find a list of all available courses, along with descriptions and ratings.
- **Seamless Enrollment:** Course purchase is completed via a checkout flow that includes **Razorpay** integration for payment handling.
- **Personalized Learning:** View and access course content, including videos and other related material.
- **Wishlist & Ratings:** Students can add courses to their wishlist and view and rate courses.

### For Instructors 🧑‍🏫

- **Full Course Management (CRUD):** Instructors can create, read, update, and delete courses, as well as manage course content and media.
- **Performance Insights:** View detailed insights into their courses, including the number of views and clicks.
- **Dashboard:** Provides an overview of the instructor's courses, along with ratings and feedback for each course.
- **Profile Management:** Instructors can view and edit their account details.

### Core Technology ⚙️

- **Cloud-Based Media:** Uses **Cloudinary** for storing and managing all media content, including images, videos, and documents.
- **Authentication & Security:** Uses **JWT** (JSON Web Tokens) for authentication/authorization and **Bcrypt** for password hashing.
- **User Verification:** Supports OTP (One-Time Password) verification and forgot password functionality.
- **Architecture:** Follows a monolithic architecture using Node.js and Express.js.

---

## 🛠️ Tech Stack

| Area                 | Technology             | Specific Tool/Library                                      |
| :------------------- | :--------------------- | :--------------------------------------------------------- |
| **Frontend**         | **ReactJS**            | Primary library for user interfaces.                       |
| **Styling**          | **CSS & Tailwind**     | Styling frameworks for a good, responsive UI.              |
| **State Management** | **Redux**              | Used to manage the state of the application.               |
| **Backend**          | **NodeJS & ExpressJS** | Frameworks for building scalable server-side applications. |
| **Database**         | **MongoDB & Mongoose** | NoSQL database for flexible data storage.                  |
| **API Style**        | **RESTful API**        | Communication between front-end and back-end.              |

---

## 🏗️ System Architecture

StudyNotion follows a client-server architecture with three main components:

1. **Front-end:** Built with ReactJS and communicates with the back-end using **RESTful API** calls.
2. **Back-end:** Built with NodeJS and ExpressJS, providing APIs for the front end, and handling logic and data storage.
3. **Database:** Uses MongoDB for flexible and scalable storage of unstructured and semi-structured data like course content, user data, and other information.

---

## 📄 Postman API Documentation

You can explore all available API endpoints, request/response examples, and test the StudyNotion APIs here:

**[StudyNotion Postman API Docs](https://documenter.getpostman.com/view/24441701/2s93kz6REm)**

---

## 💡 Future Enhancements (Roadmap)

| Enhancement                          | Priority       | Improvement                                                                   |
| :----------------------------------- | :------------- | :---------------------------------------------------------------------------- |
| **Personalized Learning Paths**      | High           | Increases student satisfaction and success.                                   |
| **Mobile App**                       | High           | Allows for more convenient access and increases the platform's reach.         |
| **Machine Learning Recommendations** | Medium to High | Improves student engagement and satisfaction.                                 |
| **Gamification Features**            | Medium         | Increases user engagement and motivation with badges and leaderboards.        |
| **Social Learning Features**         | Medium         | Increases student engagement via group discussions and peer-to-peer feedback. |
| **VR/AR Integration**                | Low to Medium  | Enhances the learning experience and makes it more immersive.                 |

---

## 🌐 Deployment & Hosting

The application is deployed across various cloud-based services for scalability, security, and reliability:

- **Front-end:** Deployed using **Vercel**
- **Back-end:** Hosted on **Render** or **Railway**
- **Media Files:** Hosted on **Cloudinary**
- **Database:** Hosted on **MongoDB Atlas**
