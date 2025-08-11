import { Chart as ChartJS, ArcElement, Legend, Tooltip } from "chart.js";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { appwriteConfig, databases } from "../lib/appwrite";
import { Query } from "appwrite";
import { Alert, Card, Spinner } from "flowbite-react";
import { Doughnut } from "react-chartjs-2";
import AnimatedNavLink from "../components/AnimatedNavLink";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAndCalculateStats = async () => {
      try {
        const [categoryRes, productRes] = await Promise.all([
          databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
            [Query.equal("user_id", user.$id)]
          ),
          databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.productsCollectionId,
            [Query.equal("user_id", user.$id)]
          ),
        ]);

        const products = productRes.documents;
        const categories = categoryRes.documents;

        // Calculate Stats
        const totalProducts = products.length;
        const totalValue = products.reduce(
          (sum, p) => sum + p.price * p.quantity,
          0
        );

        const productsPerCategory = categories.map((cat) => {
          const count = products.filter(
            (p) => p.category_id === cat.$id
          ).length;
          return { name: cat.name, count };
        });

        setStats({
          totalProducts,
          totalCategories: categories.length,
          totalValue,
        });

        //Prepare Chart Data
        setChartData({
          labels: productsPerCategory.map((c) => c.name),
          datasets: [
            {
              label: "# of Products",
              data: productsPerCategory.map((c) => c.count),
              backgroundColor: [
                "rgba(255, 99, 132, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(255, 206, 86, 0.7)",
                "rgba(75, 192, 192, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(255, 159, 64, 0.7)",
              ],
              borderColor: "rgba(255, 255, 255, 0.3)",
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error("Failed to calculate stats:", err);
        setError("Could not load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCalculateStats();
  }, [user.$id]);

  if (isLoading)
    return (
      <div className="p-8 text-center">
        <Spinner size="xl" />
      </div>
    );

  if (error)
    return (
      <div className="p-8">
        <Alert color="failure">{error}</Alert>
      </div>
    );

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-center mb-6 text-4xl font-bold text-white">
        <AnimatedNavLink to="" text="Dashboard " />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <Card className="dash_card">
          <h2 className="text-3xl font-bold">{stats?.totalProducts}</h2>
          <p className="text-gray-500">Total Products</p>
        </Card>
        <Card className="dash_card">
          <h2 className="text-3xl font-bold">{stats?.totalCategories}</h2>
          <p className="text-gray-500">Total Categories</p>
        </Card>
        <Card className="dash_card">
          <h2 className="text-3xl font-bold">
            ₹{stats?.totalValue.toFixed(2)}
          </h2>
          <p className="text-gray-500">Total Inventory Value</p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="dash_card">
        <h2 className="text-xl font-semibold mb-4 flex justify-center">
          Products Per Category
        </h2>
        <div className="mx-auto max-w-sm">
          {chartData && <Doughnut data={chartData} />}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
