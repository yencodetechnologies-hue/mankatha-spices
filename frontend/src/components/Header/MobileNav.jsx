import SingleNavItem from "./SingleNavItem";
import { AiOutlineClose } from "react-icons/ai";
import { navLinks } from "../../Data";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { FaHeart } from "react-icons/fa";

const MobileNav = ({ closeSideMenu }) => {
  const navigate = useNavigate();

  const handleDonateClick = () => {
    navigate("/donate");
    closeSideMenu();
  };

  useEffect(() => {
    // Add the class to disable scrolling when the component is mounted
    document.body.classList.add("overflow-hidden");

    // Remove the class when the component is unmounted
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div className="fixed overflow-y-hidden z-20 left-0 top-0 flex h-[100vh] w-full justify-end bg-black/60 md:hidden">
      <div className="h-full w-[65%] z-50 bg-white px-4 py-4">
        <section className="flex justify-end">
          <AiOutlineClose
            onClick={() => {
              closeSideMenu();
              document.body.classList.remove("overflow-hidden"); // Remove the class when menu is closed
            }}
            className="cursor-pointer text-black text-4xl"
          />
        </section>
        <div className="flex flex-col text-base gap-2 transition-all">
          <div className="flex">
            {/* <select id="language" className="bg-[#1EA8DF] px-4 py-2 outline-none">
              <option value="english">English</option>
              <option value="tamil">Tamil</option>
              <option value="sinhala">Sinhala</option>
            </select> */}
          </div>
          {navLinks.map((d, i) => (
            <SingleNavItem
              key={i}
              title={d.title}
              to={d.to}
              submenu={d.submenu}
              closeSideMenu={() => {
                closeSideMenu();
                document.body.classList.remove("overflow-hidden"); // Remove the class when menu is closed
              }}
            />
          ))}
        </div>
        {/* <section className="flex flex-col gap-8 mt-4 items-center">
          <button
            className="px-4 py-2 bg-[#1EA8DF] flex text-white font-bold rounded-full items-center justify-center gap-1"
            onClick={handleDonateClick}
          >
            <FaHeart />
            Donate Now
          </button>
        </section> */}
      </div>
    </div>
  );
};

export default MobileNav;
