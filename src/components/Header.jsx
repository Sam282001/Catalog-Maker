import { useNavigate, Link } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
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
    <Navbar fluid className="dark app-bg sticky top-0 z-50">
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

      {/* This is the new container for your centered link */}
      <div className="hidden md:flex justify-center flex-grow">
        <AnimatedNavLink to="/" text="Home" />
      </div>

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
      </div>
    </Navbar>
  );
};

export default Header;
