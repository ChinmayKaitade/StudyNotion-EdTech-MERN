import React, { useEffect, useState, useRef } from "react";
import ReactStars from "react-stars";
import { FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { Autoplay, FreeMode } from "swiper/modules";

import Img from "./Img";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";

function ReviewSlider() {
  const [reviews, setReviews] = useState([]);
  const swiperRef = useRef(null); // to store swiper instance

  // 🔹 Fetch all reviews
  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        );
        if (data?.success) {
          setReviews(data?.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    })();
  }, []);

  // 🔹 If no reviews found, don't render anything
  if (!reviews?.length) return null;

  return (
    <div className="text-white w-full flex justify-center items-center my-14">
      <div className="h-auto w-full max-w-maxContentTab lg:max-w-maxContent">
        <Swiper
          modules={[FreeMode, Autoplay]}
          slidesPerView="auto"
          spaceBetween={30}
          loop={true}
          freeMode={true}
          speed={4000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          onSwiper={(swiper) => (swiperRef.current = swiper)} // store swiper instance
          className="w-full"
        >
          {reviews.map((review, i) => {
            const name = `${review?.user?.firstName || ""} ${
              review?.user?.lastName || ""
            }`;

            return (
              <SwiperSlide key={i} className="!w-[320px]">
                <div
                  className="flex flex-col justify-between gap-3 bg-richblack-800/60 backdrop-blur-md border border-richblack-700/40 rounded-2xl p-5 min-h-[220px] text-richblack-25 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out cursor-pointer"
                  // 🟡 Stop autoplay when hovered
                  onMouseEnter={() => {
                    swiperRef.current?.autoplay.stop();
                  }}
                  // 🟢 Resume autoplay when mouse leaves
                  onMouseLeave={() => {
                    swiperRef.current?.autoplay.start();
                  }}
                >
                  {/* 🔹 User Info Section */}
                  <div className="flex items-center gap-4">
                    <Img
                      src={
                        review?.user?.image
                          ? review?.user?.image
                          : `https://api.dicebear.com/5.x/initials/svg?seed=${name}`
                      }
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover border border-richblack-600"
                    />
                    <div className="flex flex-col">
                      <h1 className="font-semibold text-richblack-5 capitalize text-sm">
                        {name}
                      </h1>
                      <h2 className="text-[12px] font-medium text-richblack-400">
                        {review?.course?.courseName}
                      </h2>
                    </div>
                  </div>

                  {/* 🔹 Review Text */}
                  <p className="text-richblack-50 text-[13px] font-normal leading-relaxed line-clamp-3">
                    {review?.review}
                  </p>

                  {/* 🔹 Rating Section */}
                  <div className="flex items-center gap-2 mt-auto">
                    <h3 className="font-semibold text-yellow-100 text-[15px]">
                      {parseFloat(review.rating).toFixed(1)}
                    </h3>
                    <ReactStars
                      count={5}
                      value={parseFloat(review.rating)}
                      size={18}
                      edit={false}
                      isHalf={true}
                      color="#4B5563"
                      activeColor="#FFD700"
                      emptyIcon={<FaStar />}
                      halfIcon={<FaStar />}
                      fullIcon={<FaStar />}
                    />
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}

export default ReviewSlider;

// *****************************************************
// *****************************************************
// Static Rating and Reviews
// *****************************************************
// *****************************************************

// import React, { useEffect, useState } from "react";
// import ReactStars from "react-stars";
// import { FaStar } from "react-icons/fa";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/free-mode";
// import "swiper/css/pagination";
// import { Autoplay, FreeMode } from "swiper/modules";

// import Img from "./Img";
// import { apiConnector } from "../../services/apiConnector";
// import { ratingsEndpoints } from "../../services/apis";

// function ReviewSlider() {
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await apiConnector(
//           "GET",
//           ratingsEndpoints.REVIEWS_DETAILS_API
//         );
//         if (data?.success) {
//           setReviews(data?.data);
//         }
//       } catch (error) {
//         console.error("Error fetching reviews:", error);
//       }
//     })();
//   }, []);

//   if (!reviews?.length) return null;

//   return (
//     <div className="text-white w-full flex justify-center items-center my-14">
//       <div className="h-auto w-full max-w-maxContentTab lg:max-w-maxContent">
//         <Swiper
//           modules={[FreeMode, Autoplay]}
//           breakpoints={{
//             640: { slidesPerView: 1 },
//             768: { slidesPerView: 2 },
//             1024: { slidesPerView: 3 },
//           }}
//           spaceBetween={30}
//           loop={true}
//           freeMode={true}
//           autoplay={{
//             delay: 3000,
//             disableOnInteraction: false,
//           }}
//           className="w-full"
//         >
//           {reviews.map((review, i) => {
//             const name = `${review?.user?.firstName || ""} ${
//               review?.user?.lastName || ""
//             }`;

//             return (
//               <SwiperSlide key={i}>
//                 <div className="flex flex-col justify-between gap-3 bg-richblack-800/60 backdrop-blur-md border border-richblack-700/40 rounded-2xl p-5 min-h-[220px] text-richblack-25 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out">
//                   {/* User Info */}
//                   <div className="flex items-center gap-4">
//                     <Img
//                       src={
//                         review?.user?.image
//                           ? review?.user?.image
//                           : `https://api.dicebear.com/5.x/initials/svg?seed=${name}`
//                       }
//                       alt={name}
//                       className="h-10 w-10 rounded-full object-cover border border-richblack-600"
//                     />
//                     <div className="flex flex-col">
//                       <h1 className="font-semibold text-richblack-5 capitalize text-sm">
//                         {name}
//                       </h1>
//                       <h2 className="text-[12px] font-medium text-richblack-400">
//                         {review?.course?.courseName}
//                       </h2>
//                     </div>
//                   </div>

//                   {/* Review Text */}
//                   <p className="text-richblack-50 text-[13px] font-normal leading-relaxed line-clamp-3">
//                     {review?.review}
//                   </p>

//                   {/* Rating Section */}
//                   <div className="flex items-center gap-2 mt-auto">
//                     <h3 className="font-semibold text-yellow-100 text-[15px]">
//                       {parseFloat(review.rating).toFixed(1)}
//                     </h3>
//                     <ReactStars
//                       count={5}
//                       value={parseFloat(review.rating)}
//                       size={18}
//                       edit={false}
//                       isHalf={true}
//                       color="#4B5563"
//                       activeColor="#FFD700"
//                       emptyIcon={<FaStar />}
//                       halfIcon={<FaStar />}
//                       fullIcon={<FaStar />}
//                     />
//                   </div>
//                 </div>
//               </SwiperSlide>
//             );
//           })}
//         </Swiper>
//       </div>
//     </div>
//   );
// }

// export default ReviewSlider;
