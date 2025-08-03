import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user } = useAuth();

  //If no user, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  //If user exists, render child routes.
  // The <Outlet /> component is a placeholder for the nested route components.
  return <Outlet />;
};

export default ProtectedRoute;
