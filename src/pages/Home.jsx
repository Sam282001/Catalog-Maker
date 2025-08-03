import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card } from "flowbite-react";
import ProductCarousel from "../components/ProductCarousel";

import { FaPlus, FaTasks, FaFilePdf, FaSave, FaChartPie } from "react-icons/fa";
import { useEffect, useState } from "react";
import { appwriteConfig, databases } from "../lib/appwrite";
import { Query } from "appwrite";

const Home = () => {
  const { user } = useAuth();

  // Sample images for the carousel.
  const sampleImages = [
    "https://placehold.co/100x140/purple/white?text=Product+1",
    "https://placehold.co/100x140/blue/white?text=Product+2",
    "https://placehold.co/100x140/green/white?text=Product+3",
    "https://placehold.co/100x140/orange/white?text=Product+4",
    "https://placehold.co/100x140/red/white?text=Product+5",
    "https://placehold.co/100x140/teal/white?text=Product+6",
    "https://placehold.co/100x140/indigo/white?text=Product+7",
    "https://placehold.co/100x140/pink/white?text=Product+8",
    "https://placehold.co/100x140/yellow/black?text=Product+9",
    "https://placehold.co/100x140/gray/white?text=Product+10",
  ];

  //Stats for carousel images and loading
  const [carouselImages, setCarouselImages] = useState(sampleImages);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductImages = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          [Query.equal("user_id", user.$id), Query.limit(10)] //// Get up to 10 products
        );

        if (response.documents.length > 0) {
          const imageUrls = response.documents.map(
            (product) =>
              `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageBucketId}/files/${product.image_id}/view?project=${appwriteConfig.projectId}`
          );
          setCarouselImages(imageUrls);
        }

        //If no products, it will show sample images
      } catch (error) {
        console.error("Failed to fetch product images for carousel:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductImages();
  }, [user.$id]);

  const dashboardItems = [
    {
      title: "Dashboard",
      description: "View analytics and stats about your inventory.",
      link: "/dashboard",
      icon: (
        <FaChartPie
          size={28}
          className="mb-2 text-gray-500 dark:text-gray-400"
        />
      ),
    },
    {
      title: "Add Product",
      description: "Add a new product",
      link: "/add-product",
      icon: (
        <FaPlus size={28} className="mb-2 text-gray-500 dark:text-gray-400" />
      ),
    },
    {
      title: "Manage Product",
      description: "View, edit, or delete your existing products.",
      link: "/manage-products",
      icon: (
        <FaTasks size={28} className="mb-2 text-gray-500 dark:text-gray-400" />
      ),
    },
    {
      title: "Create Catalog",
      description: "Select products to generate a new PDF catalog.",
      link: "/create-catalog",
      icon: (
        <FaFilePdf
          size={28}
          className="mb-2 text-gray-500 dark:text-gray-400"
        />
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-8">
      {!isLoading && <ProductCarousel images={carouselImages} />}
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
        Welcome back, {user?.name}
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardItems.map((item) => (
          <Link to={item.link} key={item.title}>
            <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-700">
              {item.icon}
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {item.title}
              </h2>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                {item.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
