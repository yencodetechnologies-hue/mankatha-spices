import { Outlet } from "react-router-dom";
import Footer from "../../components/Footer";

import Navbar from "../../components/Header/Navbar";

export default function Root() {
  return (
    <div>
      <Navbar/>
      <div className="content">
        <Outlet />
      </div>
      <Footer/>
    </div>
  );
}