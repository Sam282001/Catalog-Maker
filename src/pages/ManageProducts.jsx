import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { appwriteConfig, databases, storage } from "../lib/appwrite";
import { Query } from "appwrite";
import {
  Alert,
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
  Textarea,
} from "flowbite-react";
import useDebounce from "../hooks/useDebounce";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import AnimatedNavLink from "../components/AnimatedNavLink";

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

        // Fetch the products using the dynamic query
        const productRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          queries
        );

        // Process the products with their image URLs and category names
        const productsWithDetails = productRes.documents.map((product) => {
          const imageUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageBucketId}/files/${product.image_id}/view?project=${appwriteConfig.projectId}`;
          return {
            ...product,
            imageUrl: imageUrl,
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
  }, [user.$id, debouncedSearchTerm, filterCategory]); // Re-fetch when user, search, or filter changes

  const handleDelete = async (productId, imageId) => {
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
      await storage.deleteFile(appwriteConfig.storageBucketId, imageId);

      //Update the UI by removing deleted product from state
      setProducts(products.filter((p) => p.$id !== productId));
    } catch (err) {
      console.log("Failed to delete product", err);
      setError("Failed to delete product. Please try again");
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    setEditingProduct({
      ...editingProduct,
      [e.target.id]: e.target.value,
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const { name, quantity, price, description, category_id } = editingProduct;
    const updatedData = {
      name,
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
      description,
      category_id,
    };

    try {
      const updatedProductDoc = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        editingProduct.$id,
        updatedData
      );

      // Find the full category object from our 'categories' state
      const newCategory = categories.find(
        (cat) => cat.$id === updatedProductDoc.category_id
      );
      const newCategoryName = newCategory ? newCategory.name : "Unknown";

      // Update the product in the local state, now including the new categoryName
      setProducts(
        products.map((p) =>
          p.$id === updatedProductDoc.$id
            ? { ...p, ...updatedProductDoc, categoryName: newCategoryName }
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

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen">
      <div className="flex flex-col items-center">
        <div className="mb-6 text-4xl font-bold text-white">
          <AnimatedNavLink to="" text="Manage Products " />
        </div>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onFilterClick={() => {
          setTempFilterCategory(filterCategory);
          setShowFilterModal(true);
        }}
      />

      {error && (
        <Alert color="failure" onDismiss={() => setError("")} className="mb-4">
          {error}
        </Alert>
      )}

      {/* <div className="overflow-x-auto">
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Image</TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Category</TableHeadCell>
              <TableHeadCell>Price</TableHeadCell>
              <TableHeadCell>Quantity</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {products.map((product) => (
              <TableRow
                key={product.$id}
                className="bh-white dark:border-gray-700 dark:bg-gray-800"
              >
                <TableCell>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-12 w-12 object-cover"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {product.name}
                </TableCell>
                <TableCell>{product.categoryName}</TableCell>
                <TableCell>₹{product.price.toFixed(2)}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button
                    size="xs"
                    color="blue"
                    onClick={() => handleEditClick(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => handleDelete(product.$id, product.image_id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {products.length === 0 && !isLoading && (
          <div className="p-8 text-center text-gray-500">
            {searchTerm
              ? `No products found matching "${searchTerm}".`
              : "You haven't added any products yet."}
          </div>
        )}
      </div> */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.$id}
            product={product}
            onEdit={handleEditClick}
            onDelete={handleDelete}
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
    </div>
  );
};

export default ManageProducts;
