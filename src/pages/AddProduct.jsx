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
import AnimatedNavLink from "../components/AnimatedNavLink";

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
  const [showManageModel, setShowManageModel] = useState(false);

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

  const handleDeleteCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? Products using it will no longer have a category."
      )
    ) {
      return;
    }

    try {
      //1. Delete the document from Appwrite collection
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesCollectionId,
        categoryId
      );

      //2. Update the local state to instantly reflect the change
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.$id !== categoryId)
      );
    } catch (err) {
      console.error("Failed to Delete Catgeory: ", err);
      setError("Failed to delete category. It might be in use");
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
    <div className="p-4 sm:p-8 flex flex-col items-center min-h-screen">
      <div className="mb-6 text-4xl font-bold text-white">
        <AnimatedNavLink to="/" text="Add a New Product " />
      </div>

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
        className="flex w-full max-w-2xl flex-col gap-4 text-white"
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
            placeholder="Enter Product Name"
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
          />
        </div>
        <div>
          <Label htmlFor="description" value="Product Description" />
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
        </div>

        {/* Category Selection */}
        <div className="flex items-end gap-2">
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

          <Button color="green" onClick={() => setShowCategoryModal(true)}>
            New
          </Button>

          <Button onClick={() => setShowManageModel(true)}>Manage</Button>
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
                placeholder="Category Name"
              />
            </div>
            <Button type="submit">Save Category</Button>
          </form>
        </ModalBody>
      </Modal>

      {/* Modal for Managing Categories */}
      <Modal show={showManageModel} onClose={() => setShowManageModel(false)}>
        <ModalHeader>Manage Categories</ModalHeader>
        <ModalBody>
          <div className="space-y-2">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <div
                  key={cat.$id}
                  className="flex items-center justify-between rounded-l border-2 border-black p-2 text-black bg-white"
                >
                  <span>{cat.name}</span>
                  <Button
                    color="red"
                    outline
                    size="xs"
                    onClick={() => handleDeleteCategory(cat.$id)}
                    className="cursor-pointer"
                  >
                    Delete
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-white">No categories found.</p>
            )}
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AddProduct;
