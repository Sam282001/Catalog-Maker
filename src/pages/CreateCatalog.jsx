import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { appwriteConfig, databases } from "../lib/appwrite";
import { jsPDF } from "jspdf";

import { Query } from "appwrite";
import autoTable from "jspdf-autotable";
import {
  Alert,
  Button,
  Checkbox,
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
} from "flowbite-react";
import AnimatedNavLink from "../components/AnimatedNavLink";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import useDebounce from "../hooks/useDebounce";
import SearchBar from "../components/SearchBar";

const CreateCatalog = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State for filter categories
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [tempFilterCategory, setTempFilterCategory] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  //State to track selected Products IDs
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Add state for the search term
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

        // Dynamically build the query for products
        const queries = [Query.equal("user_id", user.$id)];
        if (debouncedSearchTerm) {
          queries.push(Query.search("name", debouncedSearchTerm));
        }
        if (filterCategory) {
          queries.push(Query.equal("category_id", filterCategory));
        }
        queries.push(Query.limit(100)); //Fetching limit - 100 products from appwrite

        // Then, fetch all products
        const productRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          queries
          // [Query.equal("user_id", user.$id), Query.limit(100)] //Fetching limit - 100 products from appwrite
        );

        // Manually construct the direct URL to the raw file
        const productsWithDetails = productRes.documents.map((product) => {
          return {
            ...product,
            imageUrl: product.image_url,
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
  }, [user.$id, debouncedSearchTerm, filterCategory]);

  // handle filter apply
  const handleApplyFilters = () => {
    setFilterCategory(tempFilterCategory);
    setShowFilterModal(false);
  };

  //handle product selection
  const handleProductSelect = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  //select all
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      //If all selected, deselect all
      setSelectedProducts([]);
    } else {
      //select all
      setSelectedProducts(products.map((p) => p.$id));
    }
  };

  //Generate PDF
  const handleCreateCatalog = async () => {
    const doc = new jsPDF();

    //Filter products to include only selected ones
    const selectedProductsData = products.filter((p) =>
      selectedProducts.includes(p.$id)
    );

    const loadImage = (product) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve({ img, product });
        img.onerror = (err) => reject(err);
        img.src = product.imageUrl;
      });
    };

    const loadedImages = await Promise.all(selectedProductsData.map(loadImage));

    doc.text("Product Catalog", 14, 16);

    const tableColumn = ["Image", "Name", "Category", "Price", "Quantity"];
    const tableRows = [];

    // 1. Prepare the text data for the table, leaving a placeholder for images

    selectedProductsData.forEach((product) => {
      const productData = [
        "", //image placeholder
        product.name,
        product.categoryName,
        product.price.toFixed(2),
        product.quantity,
      ];
      tableRows.push(productData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { valign: "middle" },
      minCellHeight: 30,

      //Using didDrawCell hook to add images
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.row.section === "body") {
          // Find the pre-loaded image and draw it
          const loadedItem = loadedImages[data.row.index];
          if (loadedItem) {
            const cellHeight = data.cell.height - 4;
            doc.addImage(
              loadedItem.img,
              "JPEG",
              data.cell.x + 2,
              data.cell.y + 2,
              cellHeight,
              cellHeight
            );
          }
        }
        //Only draw on the 'image' column in table body
        // if (data.column.index === 0 && data.row.section === "body") {
        //   const product = selectedProductsData[data.row.index];
        //   if (product && product.imageUrl) {
        //     try {
        //       //Create a new img obj to ensure it's loaded
        //       const img = new Image();
        //       img.crossOrigin = "Anonymous";
        //       img.src = product.imageUrl;

        //       //Use cell's dimension to draw image
        //       const cellHeight = data.cell.height - 4;
        //       doc.addImage(
        //         img,
        //         "JPEG",
        //         data.cell.x + 2,
        //         data.cell.y + 2,
        //         cellHeight,
        //         cellHeight
        //       );
        //     } catch (error) {
        //       console.log(
        //         `Could not add image for product: ${product.name}`,
        //         error
        //       );
        //     }
        //   }
        // }
      },

      //margin to the image for better spacing
      columnStyles: {
        0: { cellWidth: 32 },
      },
    });

    doc.save("product-catalog.pdf");
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
    <div className="p-4 sm:p-8 flex flex-col">
      <div className="flex justify-center mb-6 text-4xl font-bold text-white">
        <AnimatedNavLink to="" text="Create Catalog " />
      </div>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onFilterClick={() => {
          setTempFilterCategory(filterCategory);
          setShowFilterModal(true);
        }}
      />

      {products.length > 0 ? (
        <>
          <p className="mb-4 text-white">
            Select the products you want to include in your PDF catalog.
          </p>

          {error && (
            <Alert
              color="failure"
              onDismiss={() => setError("")}
              className="mb-4"
            >
              {error}
            </Alert>
          )}
          {/* If products exist, show the table */}
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead>
                <TableRow>
                  <TableHeadCell className="p-4">
                    <Checkbox
                      onChange={handleSelectAll}
                      checked={
                        products.length > 0 &&
                        selectedProducts.length === products.length
                      }
                    />
                  </TableHeadCell>
                  <TableHeadCell>Image</TableHeadCell>
                  <TableHeadCell>Name</TableHeadCell>
                  <TableHeadCell>Category</TableHeadCell>
                  <TableHeadCell>Price</TableHeadCell>
                  <TableHeadCell>Quantity</TableHeadCell>
                </TableRow>
              </TableHead>

              <TableBody className="divide-y">
                {products.map((product) => (
                  <TableRow
                    key={product.$id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <TableCell className="p-4">
                      <Checkbox
                        checked={selectedProducts.includes(product.$id)}
                        onChange={() => handleProductSelect(product.$id)}
                      />
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleCreateCatalog}
              disabled={selectedProducts.length === 0}
            >
              Create Catalog ({selectedProducts.length} selected)
            </Button>
          </div>
        </>
      ) : (
        // If no products exist, show this message and button
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-400 mb-4">
            No products added yet. Add products to create a catalog.
          </p>
          <Button as={Link} to="/add-product">
            Add a Product
          </Button>
        </div>
      )}

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

export default CreateCatalog;
