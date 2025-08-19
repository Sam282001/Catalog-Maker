import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { appwriteConfig, databases, storage } from "../lib/appwrite";
import { Query } from "appwrite";
import {
  Alert,
  Button,
  Dropdown,
  DropdownItem,
  FileInput,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Spinner,
  TextInput,
  Textarea,
} from "flowbite-react";
import useDebounce from "../hooks/useDebounce";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import AnimatedNavLink from "../components/AnimatedNavLink";
import Loader from "../components/Loader";
import PopImgModal from "../components/PopImgModal";
import CustomPagination from "../components/CustomPagination";
import { FaFilter } from "react-icons/fa";
import CustomSortDropdown from "../components/SortDropdown";
import SortDropdown from "../components/SortDropdown";

const PRODUCTS_PER_PAGE = 12;

const ManageProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  //State for Search and Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce for 500ms

  // Temporary state for the modal's selection
  const [tempFilterCategory, setTempFilterCategory] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  //State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // State for the image pop-up modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  // State for Editing Product Image
  const [newProductImage, setNewProductImage] = useState(null);

  //State for sort products
  const [sortOption, setSortOption] = useState("date_desc");

  const sortOptions = [
    { value: "date_desc", label: "Date Added (Newest)" },
    { value: "date_asc", label: "Date Added (Oldest)" },
    { value: "name_asc", label: "Alphabetical (A-Z)" },
    { value: "name_desc", label: "Alphabetical (Z-A)" },
  ];

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setIsLoading(true);
      setError(""); // Reset error on new fetch
      try {
        // Fetch Categories for the filter dropdown AND for mapping names
        const categoryRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.categoriesCollectionId,
          [Query.equal("user_id", user.$id)]
        );

        const categoryMap = categoryRes.documents.reduce((map, cat) => {
          map[cat.$id] = cat.name;
          return map;
        }, {});
        setCategories(categoryRes.documents);

        // Dynamically build the query for products
        const queries = [Query.equal("user_id", user.$id)];
        if (debouncedSearchTerm) {
          queries.push(Query.search("name", debouncedSearchTerm));
        }
        if (filterCategory) {
          queries.push(Query.equal("category_id", filterCategory));
        }

        // Add sorting to the query
        switch (sortOption) {
          case "date_asc":
            queries.push(Query.orderAsc("$createdAt"));
            break;
          case "name_asc":
            queries.push(Query.orderAsc("name"));
            break;
          case "name_desc":
            queries.push(Query.orderDesc("name"));
            break;
          default: // date_desc
            queries.push(Query.orderDesc("$createdAt"));
            break;
        }

        // limit and offset for pagination
        queries.push(Query.limit(PRODUCTS_PER_PAGE));
        queries.push(Query.offset((currentPage - 1) * PRODUCTS_PER_PAGE));

        // Fetch the products using the dynamic query
        const productRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          queries
        );

        // total products for pagination controls
        setTotalProducts(productRes.total);

        // Process the products with their image URLs and category names
        const productsWithDetails = productRes.documents.map((product) => {
          // const imageUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageBucketId}/files/${product.image_id}/view?project=${appwriteConfig.projectId}`;
          return {
            ...product,
            imageUrl: product.image_url,
            categoryName: categoryMap[product.category_id] || "Unknown",
          };
        });

        setProducts(productsWithDetails);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, [user.$id, debouncedSearchTerm, filterCategory, currentPage, sortOption]); // Re-fetch when user, search, or filter changes

  const handleDelete = async (productId) => {
    //imageId parameter removed
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      //Delete the database document first
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        productId
      );

      //Then delete associated image from file storage
      // await storage.deleteFile(appwriteConfig.storageBucketId, imageId);

      //Update the UI by removing deleted product from state
      setProducts(products.filter((p) => p.$id !== productId));
    } catch (err) {
      console.log("Failed to delete product", err);
      setError("Failed to delete product. Please try again");
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setNewProductImage(null);
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    setEditingProduct({
      ...editingProduct,
      [e.target.id]: e.target.value,
    });
  };

  // const handleUpdateProduct = async (e) => {
  //   e.preventDefault();
  //   if (!editingProduct) return;

  //   const { name, quantity, price, description, category_id } = editingProduct;
  //   const updatedData = {
  //     name,
  //     quantity: parseInt(quantity, 10),
  //     price: parseFloat(price),
  //     description,
  //     category_id,
  //   };

  //   try {
  //     const updatedProductDoc = await databases.updateDocument(
  //       appwriteConfig.databaseId,
  //       appwriteConfig.productsCollectionId,
  //       editingProduct.$id,
  //       updatedData
  //     );

  //     // Find the full category object from our 'categories' state
  //     const newCategory = categories.find(
  //       (cat) => cat.$id === updatedProductDoc.category_id
  //     );
  //     const newCategoryName = newCategory ? newCategory.name : "Unknown";

  //     // Update the product in the local state, now including the new categoryName
  //     setProducts(
  //       products.map((p) =>
  //         p.$id === updatedProductDoc.$id
  //           ? { ...p, ...updatedProductDoc, categoryName: newCategoryName }
  //           : p
  //       )
  //     );
  //     setShowEditModal(false);
  //   } catch (err) {
  //     console.error("Failed to update product:", err);
  //     setError("Failed to update product.");
  //   }
  // };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      let imageUrl = editingProduct.image_url; // 1. Start with the existing image URL

      // 2. Check if a new image was selected and upload it to Cloudinary
      if (newProductImage) {
        const formData = new FormData();
        formData.append("file", newProductImage);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
        const imageData = await uploadResponse.json();
        imageUrl = imageData.secure_url; // Get the new URL
      }

      // 3. Prepare the data for Appwrite (now including the image URL)
      const { name, quantity, price, description, category_id } =
        editingProduct;
      const updatedData = {
        name,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price),
        description,
        category_id,
        image_url: imageUrl, // Use the new URL (or the old one if no new image was uploaded)
      };

      // 4. Update the document in Appwrite
      const updatedProductDoc = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        editingProduct.$id,
        updatedData
      );

      // 5. Update the UI state instantly (now including the new imageUrl)
      const newCategory = categories.find(
        (cat) => cat.$id === updatedProductDoc.category_id
      );
      const newCategoryName = newCategory ? newCategory.name : "Unknown";

      setProducts(
        products.map((p) =>
          p.$id === updatedProductDoc.$id
            ? {
                ...p,
                ...updatedProductDoc,
                categoryName: newCategoryName,
                imageUrl: imageUrl,
              }
            : p
        )
      );
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update product:", err);
      setError("Failed to update product.");
    }
  };

  const handleApplyFilters = () => {
    setFilterCategory(tempFilterCategory); // Apply the filter
    setShowFilterModal(false); // Close the modal
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  if (isLoading) {
    return (
      // <div className="p-8 text-center">
      //   <Spinner size="xl" />
      // </div>
      <Loader />
    );
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen">
      <div className="flex flex-col items-center">
        <div className="mb-6 text-4xl font-bold text-white">
          <AnimatedNavLink to="" text="Manage Products " />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mb-8">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onFilterClick={() => {
            setTempFilterCategory(filterCategory);
            setShowFilterModal(true);
          }}
        />
        {/* <div>
          <Label htmlFor="sort" value="Sort by" className="sr-only" />
          <Select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full sm:w-auto"
          >
            <option value="date_desc">Date Added (Newest)</option>
            <option value="date_asc">Date Added (Oldest)</option>
            <option value="name_asc">Alphabetical (A-Z)</option>
            <option value="name_desc">Alphabetical (Z-A)</option>
          </Select>
        </div> */}

        <div className="w-full flex justify-end">
          <SortDropdown
            options={sortOptions}
            value={sortOption}
            onChange={setSortOption}
          />
        </div>
      </div>

      {error && (
        <Alert color="failure" onDismiss={() => setError("")} className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.$id}
            product={product}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onImageClick={handleImageClick}
          />
        ))}
      </div>

      {products.length === 0 && !isLoading && (
        <div className="p-8 text-center text-gray-500 col-span-full">
          {searchTerm
            ? `No products found matching "${searchTerm}".`
            : "You haven't added any products yet."}
        </div>
      )}

      {/* Pagination Component */}
      {totalProducts > PRODUCTS_PER_PAGE && (
        <div className="flex justify-center mt-8">
          <CustomPagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalProducts / PRODUCTS_PER_PAGE)}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Product Edit Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <ModalHeader>Edit Product</ModalHeader>
        <ModalBody>
          {editingProduct && (
            <form
              onSubmit={handleUpdateProduct}
              className="flex flex-col gap-4"
            >
              <div>
                <Label htmlFor="name" value="Product Name" />
                <TextInput
                  id="name"
                  required
                  value={editingProduct.name}
                  onChange={handleEditFormChange}
                  placeholder="Product Name"
                />
              </div>

              <div>
                <Label
                  htmlFor="newProductImage"
                  value="Replace Image (Optional)"
                />
                <FileInput
                  id="newProductImage"
                  onChange={(e) => setNewProductImage(e.target.files[0])}
                />
              </div>

              <div>
                <Label htmlFor="quantity" value="Quantity" />
                <TextInput
                  id="quantity"
                  type="number"
                  required
                  value={editingProduct.quantity}
                  onChange={handleEditFormChange}
                  placeholder="Quantity"
                />
              </div>
              <div>
                <Label htmlFor="price" value="Price" />
                <TextInput
                  id="price"
                  type="number"
                  step="0.01"
                  required
                  value={editingProduct.price}
                  onChange={handleEditFormChange}
                  placeholder="Price"
                />
              </div>
              <div>
                <Label htmlFor="category_id" value="Category" />
                <Select
                  id="category_id"
                  required
                  value={editingProduct.category_id}
                  onChange={handleEditFormChange}
                >
                  {categories.map((cat) => (
                    <option key={cat.$id} value={cat.$id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="description" value="Description" />
                <Textarea
                  id="description"
                  rows={3}
                  value={editingProduct.description}
                  onChange={handleEditFormChange}
                  placeholder="Description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button color="gray" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </ModalBody>
      </Modal>

      {/* Filter Modal */}
      <Modal show={showFilterModal} onClose={() => setShowFilterModal(false)}>
        <ModalHeader>Filter Products</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tempFilterCategory" value="Filter by Category" />
              <Select
                id="tempFilterCategory"
                value={tempFilterCategory}
                onChange={(e) => setTempFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.$id} value={cat.$id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={handleApplyFilters}>Apply</Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Image Pop-up Modal */}
      <PopImgModal
        show={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={selectedImageUrl}
        altText="Product Image"
      />
    </div>
  );
};

export default ManageProducts;
