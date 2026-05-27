import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { Link } from "react-router-dom";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const SingleNavItem = ({ title, to, submenu, closeSideMenu }) => {
  const [animationParent] = useAutoAnimate();
  const [isItemOpen, setItem] = useState(false);

  const toggleItem = () => {
    setItem(!isItemOpen);
  };

  return (
    <div data-aos="fade-down"  className="z-80 relative  px-2 py-3 transition-all">
      <div
        onClick={toggleItem}
        className="flex cursor-pointer items-center gap-2 text-neutral-400 group-hover:text-black"
      >
        <Link to={to} onClick={closeSideMenu}>
          <span>{title}</span>
        </Link>
        {submenu && (
          <IoIosArrowDown
            className={`text-xs transition-all ${isItemOpen && "rotate-180"}`}
          />
        )}
      </div>

      {/* Dropdown */}
      {isItemOpen && submenu && (
        <div className="w-auto flex-col gap-1 rounded-lg bg-white py-3 transition-all flex">
          {submenu.map((ch, i) => (
            <Link
              key={i}
              to={ch.to}
              className="flex cursor-pointer items-center py-1 pl-6 pr-8 text-neutral-400 hover:text-black"
              onClick={closeSideMenu}
            >
              <span className="whitespace-nowrap pl-3">{ch.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleNavItem;
