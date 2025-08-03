import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { account } from "../lib/appwrite";
import { Button, Card, Label, TextInput } from "flowbite-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 flex items-center justify-center flex-col">
      <div className="text-white lg:text-6xl md:text-4xl sm:text-3xl items-center pb-8">
        Catalog Maker
      </div>
      <Card className="w-full max-w-md">
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Sign in to your account
          </h1>
          <div>
            <Label htmlFor="email" value="Your email" />
            <TextInput
              id="email"
              type="email"
              placeholder="name@company.com"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="password" value="Your password" />
            <TextInput
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <Button type="submit">Login</Button>
          {error && (
            <div
              className="p-4 mt-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
              role="alert"
            >
              {error}
            </div>
          )}
          <div className="text-sm font-light text-gray-500 dark:text-gray-400">
            Don't have an account yet?{" "}
            <Link
              to="/signup"
              className="font-medium text-purple-600 hover:underline dark:text-purple-500"
            >
              Sign up
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
