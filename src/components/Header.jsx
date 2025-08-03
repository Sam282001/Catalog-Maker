import { useNavigate, Link } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  Button,
  Dropdown,
  DropdownItem,
  DropdownHeader,
} from "flowbite-react";
import { useAuth } from "../context/AuthContext";
import { account } from "../lib/appwrite";

const Header = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Navbar fluid rounded>
      <NavbarBrand as={Link} to="/">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Catalog Maker
        </span>
      </NavbarBrand>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            // This div looks like a button but isn't one, avoiding the error.
            <div className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
              {user?.name || "Account"}
            </div>
          }
        >
          <DropdownHeader>
            <span className="block text-sm">{user?.name}</span>
            <span className="block truncate text-sm font-medium">
              {user?.email}
            </span>
          </DropdownHeader>
          <DropdownItem onClick={handleLogout}>Sign out</DropdownItem>
        </Dropdown>
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink as={Link} to="/" active>
          Home
        </NavbarLink>
        {/* We will add more links here later */}
      </NavbarCollapse>
    </Navbar>
  );
};

export default Header;
