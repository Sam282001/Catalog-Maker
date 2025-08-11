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
  Avatar,
} from "flowbite-react";
import { useAuth } from "../context/AuthContext";
import { account } from "../lib/appwrite";
import AnimatedNavLink from "./AnimatedNavLink";

//Helper function to get initials from a name
const getInitials = (name = "") => {
  const names = name.split(" ").filter(Boolean);
  if (names.length === 0) return "?";
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

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
            <Avatar
              alt="User"
              placeholderInitials={getInitials(user?.name)}
              rounded
            />
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
