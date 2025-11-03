import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import useOnClickOutside from "../../../hooks/useOnClickOutside";
import Img from "./../../common/Img";

import { logout } from "../../../services/operations/authAPI";
import { fetchCourseCategories } from "./../../../services/operations/courseDetailsAPI";

import { VscDashboard, VscSignOut } from "react-icons/vsc";
import { AiOutlineCaretDown, AiOutlineHome } from "react-icons/ai";
import { MdOutlineContactPhone } from "react-icons/md";
import { TbMessage2Plus } from "react-icons/tb";
import { PiNotebook } from "react-icons/pi";

export default function MobileProfileDropDown() {
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  useOnClickOutside(ref, () => setOpen(false));

  const fetchSublinks = async () => {
    try {
      setLoading(true);
      const res = await fetchCourseCategories();
      setSubLinks(res);
    } catch (error) {
      console.log("Could not fetch category list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSublinks();
  }, []);

  // ✅ Hooks above — safe to early return now
  if (!user) return null;

  return (
    <button className="relative sm:hidden" onClick={() => setOpen(true)}>
      <div className="flex items-center gap-x-1">
        <Img
          src={user?.image}
          alt={`profile-${user?.firstName}`}
          className="aspect-square w-[30px] rounded-full object-cover"
        />
        <AiOutlineCaretDown className="text-sm text-richblack-100" />
      </div>

      {open && (
        <div
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[118%] right-0 min-w-[120px] z-[1000] overflow-hidden 
          rounded-lg border border-richblack-700 bg-richblack-800 divide-y divide-richblack-700"
        >
          <Link to="/dashboard/my-profile" onClick={() => setOpen(false)}>
            <div className="flex items-center gap-x-1 py-2.5 px-3 text-sm text-richblack-100">
              <VscDashboard className="text-lg" /> Dashboard
            </div>
          </Link>

          <Link to="/" onClick={() => setOpen(false)}>
            <div className="flex items-center gap-x-1 py-2.5 px-3 text-sm text-richblack-100 border-y border-richblack-700">
              <AiOutlineHome className="text-lg" /> Home
            </div>
          </Link>

          <Link to="/" onClick={() => setOpen(false)}>
            <div className="flex items-center gap-x-1 py-2.5 px-3 text-sm text-richblack-100">
              <PiNotebook className="text-lg" /> Catalog
            </div>
          </Link>

          <Link to="/about" onClick={() => setOpen(false)}>
            <div className="flex items-center gap-x-1 py-2.5 px-3 text-sm text-richblack-100 border-y border-richblack-700">
              <TbMessage2Plus className="text-lg" /> About Us
            </div>
          </Link>

          <Link to="/contact" onClick={() => setOpen(false)}>
            <div className="flex items-center gap-x-1 py-2.5 px-3 text-sm text-richblack-100">
              <MdOutlineContactPhone className="text-lg" /> Contact Us
            </div>
          </Link>

          <div
            onClick={() => {
              dispatch(logout(navigate));
              setOpen(false);
            }}
            className="flex items-center gap-x-1 py-2.5 px-3 text-sm text-richblack-100"
          >
            <VscSignOut className="text-lg" /> Logout
          </div>
        </div>
      )}
    </button>
  );
}
