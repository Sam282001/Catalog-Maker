const ProductCarousel = ({ images }) => {
  return (
    <div className="carousel-container">
      <div className="card-3d">
        {images.map((imageUrl, index) => {
          // Calculate the rotation for each card
          const rotationY = (360 / images.length) * index;
          // Calculate the animation delay for each card
          const animationDelay = `-${(20 / images.length) * index}s`;

          return (
            <div
              key={index}
              className="card-3d-item"
              style={{
                backgroundImage: `url(${imageUrl})`,
                transform: `translate(-50%, -50%) rotateY(${rotationY}deg) translateZ(250px)`,
                animationDelay: animationDelay,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductCarousel;
