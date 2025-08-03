import { BsGithub, BsInstagram, BsLinkedin, BsTwitterX } from "react-icons/bs";
import { IoEarthOutline } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 shadow-inner p-4 sm:p-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Side: Copyright */}
        <div className="text-sm">
          <span>© 2025 - All Rights Reserved</span>
        </div>

        {/* Middle: Social Icons */}
        <div className="flex space-x-6">
          <a
            href="https://www.linkedin.com/in/sameer-maitre/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-300"
          >
            <BsLinkedin size={20} />
          </a>
          <a
            href="https://github.com/Sam282001"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-300"
          >
            <BsGithub size={20} />
          </a>
          <a
            href="https://sameermaitreportfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-300"
          >
            <IoEarthOutline size={20} />
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-300"
          >
            <BsInstagram size={20} />
          </a>
        </div>

        {/* Right Side: Credit */}
        <div className="text-sm">
          <span>By - Sameer Maitre</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
