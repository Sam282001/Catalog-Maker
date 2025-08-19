import { useState, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import { HiChevronDown } from "react-icons/hi";

const SortDropdown = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the label for the currently selected value
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  // Effect to handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* The Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <FaFilter className="mr-2 h-4 w-4" />
        Sort: {selectedLabel}
        <HiChevronDown className="ml-2 h-5 w-5" />
      </button>

      {/* The Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-teal-600 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {options.map((option) => (
              <a
                key={option.value}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(option.value);
                }}
                className="block px-4 py-2 text-sm text-white hover:bg-teal-500"
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
