import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { RiDeleteBin6Line } from "react-icons/ri";

export default function RequirementsField({
  name,
  label,
  register,
  setValue,
  errors,
}) {
  const { editCourse, course } = useSelector((state) => state.course);
  const [requirement, setRequirement] = useState("");
  const [requirementsList, setRequirementsList] = useState([]);

  // 1. Initialization and Registration
  useEffect(() => {
    if (editCourse) {
      // Initialize requirementsList from course data if in edit mode
      setRequirementsList(course?.instructions);
    }

    // Register the field with validation.
    // Note: The third argument 'requirementsList' in the original code is likely intended
    // as a default value, but should be set separately if registration needs to run only once.
    // We remove it from the register call and rely on the second useEffect for value setting.
    register(name, { required: true, validate: (value) => value.length > 0 });
  }, [
    editCourse,
    name,
    register,
    course?.instructions, // Dependency for initialization data
  ]);

  // 2. Synchronization
  useEffect(() => {
    // Sync the local state array with the form value whenever the list changes
    setValue(name, requirementsList);
  }, [requirementsList, name, setValue]); // Dependencies added: requirementsList, name, setValue

  // add instruction
  const handleAddRequirement = () => {
    if (requirement && !requirementsList.includes(requirement)) {
      setRequirementsList([...requirementsList, requirement]);
      setRequirement("");
    }
  };

  // delete instruction
  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...requirementsList];
    updatedRequirements.splice(index, 1);
    setRequirementsList(updatedRequirements);
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>

      <div className="flex flex-col items-start space-y-2">
        <input
          type="text"
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          className="form-style w-full"
        />
        <button
          type="button"
          onClick={handleAddRequirement}
          className="font-semibold text-yellow-50"
        >
          Add
        </button>
      </div>

      {requirementsList.length > 0 && (
        <ul className="mt-2 list-inside list-disc">
          {requirementsList.map((requirement, index) => (
            <li key={index} className="flex items-center text-richblack-5">
              <span>{requirement}</span>
              <button
                type="button"
                className="ml-2 text-xs text-pure-greys-300 "
                onClick={() => handleRemoveRequirement(index)}
              >
                <RiDeleteBin6Line className="text-pink-200 text-sm hover:scale-125 duration-200" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  );
}
