import { Alert } from "flowbite-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { account } from "../lib/appwrite";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthFormLayout from "../components/AuthFormLayout";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passwords, setPasswords] = useState({
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [secret, setSecret] = useState("");

  //Add state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Get the tokens from the URL query parameters
    const userIdParam = searchParams.get("userId");
    const secretParam = searchParams.get("secret");

    if (userIdParam && secretParam) {
      setUserId(userIdParam);
      setSecret(secretParam);
    } else {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [searchParams]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (passwords.password !== passwords.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    if (passwords.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      await account.updateRecovery(
        userId,
        secret,
        passwords.password,
        passwords.passwordConfirm
      );
      setSuccessMessage(
        "Password updated successfully! Redirecting to login...."
      );
      setTimeout(() => navigate("/login"), 3000); // Redirect after 3 seconds
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const formTitle = (
    <>
      Reset Password,
      <br />
      <span>enter your new password</span>
    </>
  );

  return (
    <AuthFormLayout title={formTitle} onSubmit={handleReset}>
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

      <div className="relative w-full">
        <input
          className="input"
          name="password"
          placeholder="New Password"
          type={showPassword ? "text" : "password"}
          required
          value={passwords.password}
          onChange={handleInputChange}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* Confirm Password Input with Icon */}
      <div className="relative w-full">
        <input
          className="input"
          name="passwordConfirm"
          placeholder="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          required
          value={passwords.passwordConfirm}
          onChange={handleInputChange}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
        >
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <button className="button-confirm" disabled={!userId || !secret}>
        Reset →
      </button>
    </AuthFormLayout>
  );
};

export default ResetPassword;

// <div className="min-h-screen bg-black flex flex-col items-center justify-center">
//   <div className="flex items-center justify-center pb-8">
//     <img src="/logo-bgrm.png" alt="logo" className="h-24 w-auto" />
//   </div>
//   <Card className="w-full max-w-md">
//     <form className="flex flex-col gap-4" onSubmit={handleReset}>
//       <h1 className="text-xl font-bold text-white">Reset Your Password</h1>

//       {successMessage && <Alert color="success">{successMessage}</Alert>}
//       {error && <Alert color="failure">{error}</Alert>}

//       <div className="text-white relative">
//         <Label
//           htmlFor="password"
//           value="New Password"
//           className="block mb-2"
//         >
//           Password
//         </Label>
//         <TextInput
//           id="password"
//           type={showPassword ? "text" : "password"} //Dynamic type
//           required
//           value={passwords.password}
//           onChange={handleInputChange}
//           placeholder="Password"
//         />
//         <button
//           type="button"
//           onClick={() => setShowPassword(!showPassword)}
//           className="absolute inset-y-0 right-0 flex items-center pr-3 mt-7"
//           aria-label="Toggle password visibility"
//         >
//           {showPassword ? <FaEyeSlash /> : <FaEye />}
//         </button>
//       </div>
//       <div className="text-white relative">
//         <Label
//           htmlFor="passwordConfirm"
//           value="Confirm New Password"
//           className="block mb-2"
//         >
//           Confirm Password
//         </Label>
//         <TextInput
//           id="passwordConfirm"
//           type={showConfirmPassword ? "text" : "password"} // Dynamic type
//           required
//           value={passwords.passwordConfirm}
//           onChange={handleInputChange}
//           placeholder="Confirm Password"
//         />
//         <button
//           type="button"
//           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//           className="absolute inset-y-0 right-0 flex items-center pr-3  mt-7"
//           aria-label="Toggle confirm password visibility"
//         >
//           {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//         </button>
//       </div>

//       <Button type="submit" disabled={!userId || !secret}>
//         Reset Password
//       </Button>
//     </form>
//   </Card>
// </div>
