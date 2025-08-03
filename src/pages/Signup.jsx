import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ID, account } from "../lib/appwrite";
import { Button, Card, Label, TextInput } from "flowbite-react";
import { useAuth } from "../context/AuthContext";

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
    setFormData({ ...formData, [e.target.id]: e.target.value });
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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 flex items-center justify-center flex-col">
      <div className="text-white lg:text-6xl md:text-4xl sm:text-3xl items-center pb-8">
        Catalog Maker
      </div>
      <Card className="w-full max-w-md">
        <form className="flex flex-col gap-4" onSubmit={handleSignup}>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Create an Account
          </h1>
          <div>
            <Label htmlFor="name" value="Your Name" />
            <TextInput
              id="name"
              type="text"
              placeholder="Enter Your Name"
              required
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="email" value="Your Email" />
            <TextInput
              id="email"
              type="email"
              placeholder="Enter Your Email"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="password" value="Your Password" />
            <TextInput
              id="password"
              type="password"
              placeholder="Enter Your password"
              required
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <Button type="submit">Create Account</Button>
          {error && (
            <div
              className="p-4 mt-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="text-sm font-light text-gray-500 dark:text-gray-400">
            Already Have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-purple-600 hover:underline dark:text-purple-500"
            >
              Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
