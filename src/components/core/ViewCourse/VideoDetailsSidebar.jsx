import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BsChevronDown } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { HiMenuAlt1 } from "react-icons/hi";

import IconBtn from "../../common/IconBtn";
import { setCourseViewSidebar } from "../../../slices/sidebarSlice";

export default function VideoDetailsSidebar({ setReviewModal }) {
  const [activeStatus, setActiveStatus] = useState(""); // current section id
  const [videoBarActive, setVideoBarActive] = useState(""); // current subSection id

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { sectionId, subSectionId } = useParams();

  const {
    courseSectionData = [],
    courseEntireData,
    totalNoOfLectures,
    completedLectures = [],
  } = useSelector((state) => state.viewCourse);

  const { courseViewSidebar } = useSelector((state) => state.sidebar);

  // ======================================================
  // Set current section/sub-section based on URL
  // ======================================================
  useEffect(() => {
    if (!courseSectionData.length) return;

    const currentSectionIndex = courseSectionData.findIndex(
      (section) => section._id === sectionId
    );

    if (currentSectionIndex === -1) return;

    const currentSubSectionIndex = courseSectionData[
      currentSectionIndex
    ]?.subSection.findIndex((sub) => sub._id === subSectionId);

    const activeSubSectionId =
      courseSectionData[currentSectionIndex]?.subSection?.[
        currentSubSectionIndex
      ]?._id;

    setActiveStatus(courseSectionData[currentSectionIndex]?._id);
    setVideoBarActive(activeSubSectionId);
  }, [
    courseSectionData,
    courseEntireData,
    location.pathname,
    sectionId,
    subSectionId,
  ]);

  // ======================================================
  // Handle navigation to selected video
  // ======================================================
  const handleTopicClick = (section, topic) => {
    navigate(
      `/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${topic?._id}`
    );
    setVideoBarActive(topic._id);

    // ✅ Fixed ESLint issue: replaced ternary with if
    if (courseViewSidebar && window.innerWidth <= 640) {
      dispatch(setCourseViewSidebar(false));
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r border-r-richblack-700 bg-richblack-800">
      {/* ================= Header ================= */}
      <div className="mx-5 flex flex-col items-start justify-between gap-2 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25">
        <div className="flex w-full items-center justify-between">
          {/* Sidebar toggle (mobile only) */}
          <div
            className="cursor-pointer text-white sm:hidden"
            onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}
          >
            {courseViewSidebar ? (
              <IoMdClose size={33} />
            ) : (
              <HiMenuAlt1 size={33} />
            )}
          </div>

          {/* Go back button */}
          <button
            onClick={() => navigate("/dashboard/enrolled-courses")}
            className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 text-richblack-700 hover:scale-90"
            title="Back"
          >
            <IoIosArrowBack size={30} />
          </button>

          {/* Add Review button */}
          <IconBtn text="Add Review" onclick={() => setReviewModal(true)} />
        </div>

        {/* Course title & progress */}
        <div className="flex flex-col">
          <p>{courseEntireData?.courseName}</p>
          <p className="text-sm font-semibold text-richblack-500">
            {completedLectures.length} / {totalNoOfLectures}
          </p>
        </div>
      </div>

      {/* ================= Section List ================= */}
      <div className="h-[calc(100vh-5rem)] overflow-y-auto">
        {courseSectionData.map((section) => (
          <div
            key={section._id}
            className="mt-2 cursor-pointer text-sm text-richblack-5"
          >
            {/* Section Header */}
            <div
              className="flex justify-between bg-richblack-700 px-5 py-4"
              onClick={() => setActiveStatus(section._id)}
            >
              <div className="w-[70%] font-semibold">
                {section?.sectionName}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium">
                  Lessons {section?.subSection?.length || 0}
                </span>
                <span
                  className={`transform transition-transform duration-500 ${
                    activeStatus === section._id ? "rotate-0" : "rotate-180"
                  }`}
                >
                  <BsChevronDown />
                </span>
              </div>
            </div>

            {/* Sub-sections */}
            {activeStatus === section._id && (
              <div className="transition-all duration-500 ease-in-out">
                {section.subSection.map((topic) => (
                  <div
                    key={topic._id}
                    onClick={() => handleTopicClick(section, topic)}
                    className={`flex gap-3 px-5 py-2 ${
                      videoBarActive === topic._id
                        ? "bg-yellow-200 font-semibold text-richblack-800"
                        : "hover:bg-richblack-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={completedLectures.includes(topic._id)}
                      readOnly
                    />
                    {topic.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
