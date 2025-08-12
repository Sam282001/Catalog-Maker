import { useState } from "react";
import { account } from "../lib/appwrite";
import { Alert } from "flowbite-react";
import { Link } from "react-router-dom";
import AuthFormLayout from "../components/AuthFormLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      // The second argument is the URL of your reset password page
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
      setSuccessMessage(
        "If an account with this email exists, a password reset link has been sent."
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const formTitle = (
    <>
      Forgot Password,
      <br />
      <span>enter your email</span>
    </>
  );

  return (
    <AuthFormLayout title={formTitle} onSubmit={handleRequest}>
      {successMessage && (
        <Alert color="success" className="w-full">
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert color="failure" className="w-full">
          {error}
        </Alert>
      )}

      <input
        className="input"
        name="email"
        placeholder="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button className="button-confirm">Send Link →</button>

      <div className="form-link">
        <Link
          to="/login"
          className="font-medium text-purple-600 hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </AuthFormLayout>
  );
};

export default ForgotPassword;
