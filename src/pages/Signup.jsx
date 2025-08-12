import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ID, account } from "../lib/appwrite";
import { Alert } from "flowbite-react";
import { useAuth } from "../context/AuthContext";
import AuthFormLayout from "../components/AuthFormLayout";

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); //Clear Previous Errors

    try {
      // 1. Create User Account
      await account.create(
        ID.unique(),
        formData.email,
        formData.password,
        formData.name
      );

      // 2. Log the user in by creating a session
      await account.createEmailPasswordSession(
        formData.email,
        formData.password
      );

      // 3. Manually get the user data and update the global state
      const loggedInUser = await account.get();
      setUser(loggedInUser);

      // 4. Navigate to the home page
      navigate("/");
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  const formTitle = (
    <>
      Welcome,
      <br />
      <span>sign up to continue</span>
    </>
  );

  return (
    <AuthFormLayout title={formTitle} onSubmit={handleSignup}>
      <input
        className="input"
        name="name"
        placeholder="Name"
        type="text"
        required
        value={formData.name}
        onChange={handleInputChange}
      />
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

      <button className="button-confirm">Sign Up →</button>

      <div className="form-link">
        <span>Already have an account? </span>
        <Link
          to="/login"
          className="font-medium text-purple-600 hover:underline"
        >
          Login
        </Link>
      </div>
    </AuthFormLayout>
  );
};

export default Signup;
