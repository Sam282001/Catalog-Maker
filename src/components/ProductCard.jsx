import { Dropdown, DropdownItem } from "flowbite-react";
import { HiDotsVertical } from "react-icons/hi";

const ProductCard = ({ product, onEdit, onDelete, onImageClick }) => {
  return (
    <div className="product-card-v2">
      <div
        className="img border-b-2"
        onClick={() => onImageClick(product.imageUrl)}
      >
        <img src={product.imageUrl} alt={product.name} />
      </div>

      <div className="info">
        <div className="cat">{product.categoryName}</div>

        <div className="flex justify-between items-start">
          <h2 className="title">{product.name}</h2>

          {/* Dropdown menu */}
          <div>
            <Dropdown
              className="!bg-[#212121]"
              inline
              arrowIcon={false}
              label={
                <HiDotsVertical
                  size={24}
                  className="text-gray-600 hover:bg-gray-200 rounded-full p-1"
                />
              }
            >
              <DropdownItem onClick={() => onEdit(product)}>Edit</DropdownItem>
              <DropdownItem
                onClick={() => onDelete(product.$id, product.image_id)}
                className="text-red-600"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <p className="desc">
          {product.description || "No description available."}
        </p>

        <div className="bottom">
          <div className="price">
            <span className="new">₹{product.price.toFixed(2)}</span>
          </div>
          <div className="stock">Qty: {product.quantity}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
