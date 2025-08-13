const PopImgModal = ({ show, onClose, imageUrl, altText }) => {
  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative p-4"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        {/* Image */}
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default PopImgModal;
