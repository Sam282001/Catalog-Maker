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

const ManageProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // First, fetch all categories to map their names later
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

        // Then, fetch all products
        const productRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          [Query.equal("user_id", user.$id)]
        );

        // Manually construct the direct URL to the raw file
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
        console.error("Failed to fetch products: ", err);
        setError("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [user.$id]);

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

      // Update the product in the local state to refresh the UI instantly
      setProducts(
        products.map((p) =>
          p.$id === updatedProductDoc.$id ? { ...p, ...updatedProductDoc } : p
        )
      );
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update product:", err);
      setError("Failed to update product.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col items-center">
        <h1 className="mb-5 text-4xl font-bold text-black">Manage Products</h1>
      </div>
      {error && (
        <Alert color="failure" onDismiss={() => setError("")} className="mb-4">
          {error}
        </Alert>
      )}

      <div className="overflow-x-auto">
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
            You haven't added any products yet.
          </div>
        )}
      </div>

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
    </div>
  );
};

export default ManageProducts;
