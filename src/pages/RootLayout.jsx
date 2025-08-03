import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const RootLayout = () => {
  return (
    <div>
      <Header />
      <main>
        {/* Child Pages goes here */}
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
