import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const RootLayout = () => {
  return (
    <div className="bg-black min-h-screen">
      <Header />
      <main className="mt-2">
        {/* Child Pages goes here */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
