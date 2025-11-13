import { useEffect, useState } from "react";

import { MdClose } from "react-icons/md";
import { useSelector } from "react-redux";

// Defining a functional component ChipInput
export default function ChipInput({
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
}) {
  const { editCourse, course } = useSelector((state) => state.course);

  // Setting up state for managing chips array
  const [chips, setChips] = useState([]);

  // 1. useEffect for initial setup and registration
  useEffect(() => {
    if (editCourse) {
      // Initialize chips if editing a course
      setChips(course?.tag);
    }

    // Register the field with validation.
    register(name, {
      required: true,
      validate: (value) => value.length > 0,
    });

    // Set the initial value using setValue right after registration
    // Uses 'chips' to set the default value if not in edit mode.
    setValue(name, editCourse ? course?.tag : chips);
  }, [
    register,
    name,
    editCourse,
    course?.tag,
    setValue,
    chips, // FIX: Added 'chips' dependency because it is used in the setValue call
  ]);

  // 2. Updates value whenever 'chips' is modified
  useEffect(() => {
    // This effect ensures the form value in react-hook-form is always synchronized with the local 'chips' state.
    setValue(name, chips);
  }, [chips, name, setValue]); // Dependencies are already correct here

  // Function to handle user input when chips are added
  const handleKeyDown = (event) => {
    // Check if user presses "Enter" or ","
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      // Get the input value and remove any leading/trailing spaces
      const chipValue = event.target.value.trim();
      // Check if the input value exists and is not already in the chips array
      if (chipValue && !chips.includes(chipValue)) {
        // Add the chip to the array and clear the input
        const newChips = [...chips, chipValue];

        setChips(newChips);
        event.target.value = "";
      }
    }
  };

  // Function to handle deletion of a chip
  const handleDeleteChip = (chipIndex) => {
    // Filter the chips array to remove the chip with the given index
    const newChips = chips.filter((_, index) => index !== chipIndex);
    setChips(newChips);
  };

  // Render the component
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>

      <div className="flex w-full flex-wrap gap-y-2">
        {/* Render the chips */}
        {chips?.map((chip, index) => (
          <div
            key={index}
            className="m-1 flex items-center rounded-full bg-yellow-400 px-2 py-1 text-sm text-richblack-5"
          >
            {chip}

            {/* delete chip */}
            <button
              type="button"
              className="ml-2 focus:outline-none"
              onClick={() => handleDeleteChip(index)}
            >
              <MdClose className="text-sm" />
            </button>
          </div>
        ))}

        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="form-style w-full"
        />
      </div>
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  );
}
