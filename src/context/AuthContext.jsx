import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { Spinner } from "flowbite-react";
import Loader from "../components/Loader";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    //Check if a user session already exists
    const checkCurrentUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        //If no session exist, set user to null
        setUser(null);
      }
      setIsLoading(false);
    };

    checkCurrentUser();
  }, []);

  //show fullscreen loader(Spinner) while checking for user
  if (isLoading) {
    return (
      // <div className="min-h-screen w-full flex items-center justify-center">
      //   <Spinner size="xl" />
      // </div>
      <Loader />
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

//Custom hook to easily use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
