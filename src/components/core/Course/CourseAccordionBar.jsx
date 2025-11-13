import { useEffect, useRef, useState } from "react";
import CourseSubSectionAccordion from "./CourseSubSectionAccordion";

import { IoMdArrowDropdown } from "react-icons/io";

export default function CourseAccordionBar({ course, isActive, handleActive }) {
  const contentEl = useRef(null);
  // Redundant 'active' state removed: const [active, setActive] = useState(false);
  const [sectionHeight, setSectionHeight] = useState(0);

  // Directly check if this section is active using the prop
  const isThisSectionActive = isActive?.includes(course._id);

  // The state that was derived from isActive is now computed directly.
  // We only need an effect for the height calculation, which depends on 'isThisSectionActive'.
  useEffect(() => {
    // Only calculate height if the ref exists and the section is active
    setSectionHeight(isThisSectionActive ? contentEl.current.scrollHeight : 0);
  }, [isThisSectionActive]); // Dependency is the boolean status of this section

  return (
    <div className="overflow-hidden border border-solid border-richblack-600 bg-richblack-700 hover:bg-richblack-600 text-richblack-5 last:mb-0 duration-200 ">
      <div>
        <div
          className={`flex cursor-pointer items-start justify-between bg-opacity-20 px-7 py-6 transition-[0.3s]`}
          onClick={() => {
            // Toggles the active state in the parent component
            handleActive(course._id);
          }}
        >
          <div className="flex items-center gap-2">
            {/* Rotation depends directly on isThisSectionActive */}
            <i
              className={
                isThisSectionActive
                  ? "rotate-180 duration-300"
                  : "rotate-0 duration-300"
              }
            >
              <IoMdArrowDropdown size={25} />
            </i>
            <p>{course?.sectionName}</p>
          </div>
          <div className="space-x-4">
            <span className="text-yellow-25">
              {`${course.subSection.length || 0} lecture(s)`}
            </span>
          </div>
        </div>
      </div>

      <div
        ref={contentEl}
        className={`relative h-0 overflow-hidden bg-richblack-900 transition-[height] duration-[0.35s] ease-[ease]`}
        // Height state controls the accordion animation
        style={{ height: sectionHeight }}
      >
        <div className="text-textHead flex flex-col gap-2 px-7 py-6 font-semibold">
          {course?.subSection?.map((subSec, i) => {
            return <CourseSubSectionAccordion subSec={subSec} key={i} />;
          })}
        </div>
      </div>
    </div>
  );
}
