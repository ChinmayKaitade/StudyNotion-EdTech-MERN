import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import ReactStars from "react-stars";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { createRating } from "../../../services/operations/courseDetailsAPI";
import IconBtn from "./../../common/IconBtn";
import Img from "./../../common/Img";

export default function CourseReviewModal({ setReviewModal }) {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { courseEntireData } = useSelector((state) => state.viewCourse);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue("courseExperience", "");
    setValue("courseRating", 0);
  }, [setValue]);

  const ratingChanged = (newRating) => {
    setValue("courseRating", newRating);
  };

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Please login to submit your review.");
      return;
    }

    if (!courseEntireData?._id) {
      toast.error("Course data not found.");
      return;
    }

    const payload = {
      courseId: courseEntireData._id,
      rating: data.courseRating,
      review: data.courseExperience,
    };

    try {
      setIsSubmitting(true);
      const response = await createRating(payload, token);

      // ✅ If backend sends a proper message for duplicate review
      if (
        response?.data?.success === false &&
        response?.data?.message?.includes("already reviewed")
      ) {
        toast.error("You have already reviewed this course.");
      } else if (response?.status === 200) {
        toast.success("Thank you! Your review has been submitted.");
        setReviewModal(false);
      } else {
        toast.error(
          response?.data?.message || "Something went wrong. Try again."
        );
      }
    } catch (error) {
      console.error("CREATE RATING ERROR:", error);

      // Handle duplicate review or forbidden access
      if (error?.response?.status === 403) {
        toast.error("You are not authorized to rate this course.");
      } else if (error?.response?.data?.message?.includes("already reviewed")) {
        toast.error("You have already reviewed this course.");
      } else {
        toast.error("Error while submitting review. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">Add Review</p>
          <button onClick={() => setReviewModal(false)}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-x-4">
            <Img
              src={user?.image}
              alt={user?.firstName + " profile"}
              className="aspect-square w-[50px] rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-richblack-5 capitalize">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-richblack-5">Posting Publicly</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col items-center"
          >
            <ReactStars
              count={5}
              onChange={ratingChanged}
              size={24}
              color2="#ffd700"
            />

            <div className="flex w-11/12 flex-col space-y-2">
              <label
                className="text-sm text-richblack-5"
                htmlFor="courseExperience"
              >
                Add Your Experience <sup className="text-pink-200">*</sup>
              </label>
              <textarea
                id="courseExperience"
                placeholder="Add Your Experience"
                {...register("courseExperience", { required: true })}
                className="form-style resize-x-none min-h-[130px] w-full"
              />
              {errors.courseExperience && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                  Please Add Your Experience
                </span>
              )}
            </div>

            <div className="mt-6 flex w-11/12 justify-end gap-x-2">
              <button
                onClick={() => setReviewModal(false)}
                type="button"
                className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900 hover:bg-richblack-900 hover:text-richblack-300 duration-300`}
              >
                Cancel
              </button>
              <IconBtn
                text={isSubmitting ? "Saving..." : "Save"}
                disabled={isSubmitting}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
