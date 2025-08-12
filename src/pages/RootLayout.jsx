import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const RootLayout = () => {
  return (
    <div className="app-bg min-h-screen">
      <Header />
      <main className="mt-2">
        {/* Child Pages */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
