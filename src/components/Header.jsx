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
import AnimatedNavLink from "./AnimatedNavLink";

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
    <Navbar fluid className="dark !bg-black">
      <NavbarBrand as={Link} to="/">
        <img
          src="/logo-trnt.png"
          className="mr-3 h-11"
          alt="Catalog Maker Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
          Catalog Maker
        </span>
      </NavbarBrand>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <div className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-700 focus:outline-none border-gray-600 text-white">
              {user?.name || "Account"}
            </div>
          }
        >
          <DropdownHeader>
            {/* <span className="block text-sm">{user?.name}</span> */}
            <span className="block truncate text-sm font-medium">
              {user?.email}
            </span>
          </DropdownHeader>
          <DropdownItem onClick={handleLogout}>Sign out</DropdownItem>
        </Dropdown>
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <AnimatedNavLink to="/" text="Home" />
        {/*add more links here */}
      </NavbarCollapse>
    </Navbar>
  );
};

export default Header;
