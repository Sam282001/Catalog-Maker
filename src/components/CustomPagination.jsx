const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const baseButtonClass =
    "flex items-center justify-center px-4 h-10 leading-tight border transition-colors duration-200 cursor-pointer";
  const normalButtonClass =
    "border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white";
  const activeButtonClass = "bg-gray-700 border-gray-600 text-white z-10";
  const disabledButtonClass = "opacity-50 cursor-not-allowed";

  return (
    <nav aria-label="Page navigation">
      <ul className="inline-flex -space-x-px text-sm">
        {/* Previous Button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${baseButtonClass} ml-0 rounded-l-lg ${normalButtonClass} ${
              currentPage === 1 ? disabledButtonClass : ""
            }`}
          >
            Previous
          </button>
        </li>

        {/* Page Number Buttons */}
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className={`${baseButtonClass} ${
                currentPage === number ? activeButtonClass : normalButtonClass
              }`}
            >
              {number}
            </button>
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${baseButtonClass} rounded-r-lg ${normalButtonClass} ${
              currentPage === totalPages ? disabledButtonClass : ""
            }`}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default CustomPagination;
