import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { appwriteConfig, databases, storage } from "../lib/appwrite";
import { ID, Query, Permission, Role } from "appwrite";
import {
  Alert,
  Button,
  FileInput,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  TextInput,
  Textarea,
} from "flowbite-react";

const AddProduct = () => {
  const { user } = useAuth();

  //State for Form Inputs
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  //State for Categories
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  //State for UI feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  //Fetch Categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.categoriesCollectionId,
          [Query.equal("user_id", user.$id)]
        );
        setCategories(response.documents);
      } catch (err) {
        console.log("Failed to fetch categories", err);
        setError("Failed to load categories.");
      }
    };

    fetchCategories();
  }, [user.$id]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    //function logic here
    if (!newCategoryName.trim()) return;
    setIsLoading(true);

    try {
      const newCategory = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesCollectionId,
        ID.unique(),
        {
          name: newCategoryName,
          user_id: user.$id,
        }
      );

      //Add new category to the list and select it
      setCategories((prev) => [...prev, newCategory]);
      setSelectedCategory(newCategory.$id);
      setNewCategoryName("");
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
      setError("Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  // Logic to handle the main product form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    //function logic here
    if (!productImage || !selectedCategory) {
      setError(
        "Please fill out all required fields, including image and category."
      );
      return;
    }
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      // 1. Upload the image to appwrite storage with permission
      const imageResponse = await storage.createFile(
        appwriteConfig.storageBucketId,
        ID.unique(),
        productImage,
        [
          Permission.read(Role.user(user.$id)), //Allows the user to read the file
        ]
      );
      const imageId = imageResponse.$id;

      // 2. Create the product document in the database
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        ID.unique(),
        {
          name: productName,
          quantity: parseInt(quantity, 10),
          price: parseFloat(price),
          description,
          image_id: imageId,
          category_id: selectedCategory,
          user_id: user.$id,
        }
      );

      setSuccessMessage("Product Added Successfully!");

      //Reset Form Fields
      setProductName("");
      setQuantity("");
      setPrice("");
      setDescription("");
      setProductImage(null);
      setSelectedCategory("");
      document.getElementById("productImage").value = null; // Clear file input
    } catch (err) {
      console.log(err);
      setError("Failed to add product. Please try again.");
    } finally {
      setIsLoading(false);
    }

    console.log("Form Submitted");
  };

  return (
    <div className="p-4 sm:p-8 flex flex-col items-center">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-black dark:bg-white">
        Add a New Product
      </h1>

      {/* Display success or error messages */}
      {successMessage && (
        <Alert
          color="success"
          onDismiss={() => setSuccessMessage("")}
          className="mb-4"
        >
          {successMessage}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col gap-4"
      >
        {/* Form Fields */}
        <div>
          <Label htmlFor="productName" value="Product Name" />
          <TextInput
            id="productName"
            type="text"
            required
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="productImage" value="Product Image" />
          <FileInput
            id="productImage"
            required
            onChange={(e) => setProductImage(e.target.files[0])}
          />
        </div>

        <div>
          <Label htmlFor="quantity" value="Quantity" />
          <TextInput
            id="quantity"
            type="number"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="price" value="Price" />
          <TextInput
            id="price"
            type="number"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description" value="Product Description" />
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category Selection */}
        <div className="flex items-end gap-4">
          <div className="flex-grow">
            <Label htmlFor="category" value="Category" />
            <Select
              id="category"
              required
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat.$id} value={cat.$id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <Button onClick={() => setShowCategoryModal(true)}>New</Button>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Product"}
        </Button>
      </form>

      {/* Modal for Creating New Category */}
      <Modal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      >
        <ModalHeader>Create New Category</ModalHeader>
        <ModalBody>
          <form onSubmit={handleCreateCategory} className="space-y-6">
            <div>
              <Label htmlFor="newCategoryName" value="Category Name" />
              <TextInput
                id="newCategoryName"
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <Button type="submit">Save Category</Button>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AddProduct;
