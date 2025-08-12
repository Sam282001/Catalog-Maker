import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { account } from "../lib/appwrite";
import { Alert } from "flowbite-react";
import { useAuth } from "../context/AuthContext";
import AuthFormLayout from "../components/AuthFormLayout";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Create a session to login the user
      await account.createEmailPasswordSession(
        formData.email,
        formData.password
      );

      // Manually get the user data and update the global state
      const loggedInUser = await account.get();
      setUser(loggedInUser);

      //Navigate to home page on success
      navigate("/");
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  const formTitle = (
    <>
      Welcome back,
      <br />
      <span>sign in to continue</span>
    </>
  );

  return (
    <AuthFormLayout title={formTitle} onSubmit={handleLogin}>
      <input
        className="input"
        name="email"
        placeholder="Email"
        type="email"
        required
        value={formData.email}
        onChange={handleInputChange}
      />
      <input
        className="input"
        name="password"
        placeholder="Password"
        type="password"
        required
        value={formData.password}
        onChange={handleInputChange}
      />

      {error && (
        <Alert color="failure" className="w-full">
          {error}
        </Alert>
      )}

      <div className="form-link">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-purple-600 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <button className="button-confirm">Login →</button>

      <div className="form-link">
        <span>Don't have an account? </span>
        <Link
          to="/signup"
          className="font-medium text-purple-600 hover:underline"
        >
          Sign up
        </Link>
      </div>
    </AuthFormLayout>
  );
};

export default Login;
