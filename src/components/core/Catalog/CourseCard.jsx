import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import GetAvgRating from "../../../utils/avgRating";
import RatingStars from "../../common/RatingStars";
import Img from "../../common/Img";

function CourseCard({ course }) {
  const [avgReviewCount, setAvgReviewCount] = useState(0);

  useEffect(() => {
    const count = GetAvgRating(course.ratingAndReviews);
    setAvgReviewCount(count);
  }, [course]);

  return (
    <Link to={`/courses/${course._id}`}>
      <div className="bg-richblack-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer w-full sm:w-72 md:w-80">
        {/* Course Thumbnail */}
        <div className="w-full h-40 sm:h-48 md:h-52 overflow-hidden">
          <Img
            src={course?.thumbnail}
            alt={course?.courseName}
            className="w-full h-full object-cover rounded-t-xl"
          />
        </div>

        {/* Course Details */}
        <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2">
          {/* Course Name */}
          <p className="text-md sm:text-lg font-semibold text-richblack-5 line-clamp-2">
            {course?.courseName}
          </p>

          {/* Instructor Name */}
          <p className="text-xs sm:text-sm text-richblack-400">
            {course?.instructor?.firstName} {course?.instructor?.lastName}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-2 mt-1">
            <span className="text-yellow-50 font-medium text-sm sm:text-base">
              {avgReviewCount || 0}
            </span>
            <RatingStars Review_Count={avgReviewCount} size={14} />{" "}
            {/* smaller stars on mobile */}
            <span className="text-richblack-400 text-xs sm:text-sm">
              ({course?.ratingAndReviews?.length || 0} Ratings)
            </span>
          </div>

          {/* Price */}
          <p className="text-md sm:text-lg font-semibold text-yellow-50 mt-1 sm:mt-2">
            Rs. {course?.price}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;
