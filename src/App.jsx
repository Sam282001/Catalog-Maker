import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import RootLayout from "./pages/RootLayout";
import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";
import ManageProducts from "./pages/ManageProducts";
import CreateCatalog from "./pages/CreateCatalog";
import Dashboard from "./pages/Dashboard";

// const ManageProducts = () => <div>Manage Products</div>;
// const CreateCatalog = () => <div>Create Catalog</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            {/* All other protected pages will go here */}
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/manage-products" element={<ManageProducts />} />
            <Route path="/create-catalog" element={<CreateCatalog />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
