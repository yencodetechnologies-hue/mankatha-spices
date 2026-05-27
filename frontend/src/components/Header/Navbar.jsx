import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MobileNav from "./MobileNav";
import { logo } from "../../assets";
import { navLinks } from "../../Data";

import { IoIosArrowDown } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

const Navbar = () => {
    const [isSideMenuOpen, setSideMenu] = useState(false);
    const [scrollY, setScrollY] = useState(window.scrollY);
    const [scrollDirection, setScrollDirection] = useState("up");
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();
    const handleDonateClick = () => {
        navigate("/donate");
    };
    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > scrollY && currentScrollY > 100) {
            setScrollDirection("down");
            setIsVisible(false);
        } else {
            setScrollDirection("up");
            setIsVisible(true);
        }

        setScrollY(currentScrollY);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [scrollY]);

    const openSideMenu = () => {
        setSideMenu(true);
    };

    const closeSideMenu = () => {
        setSideMenu(false);
    };

    return (
        <div
            className={`fixed z-20 top-0 w-full flex md:px-24 px-6 border-b border-b-white border-opacity-20 transition-all duration-300 ${
                isVisible ? "translate-y-0" : "-translate-y-full"
            }`}
            style={{
                backgroundColor: scrollY > 50 ? "#080229" : "transparent",
            }}
        >
            <div className="mx-auto flex w-full  justify-between py-5 text-sm text-white font-bold font-nunito">
                {/* Left Section */}
                <div className="flex items-center justify-between gap-10">
                    {/* Logo */}
                    <img src={logo} alt="Logo" className="h-[60px]" />

                    
                </div>

                {/* Right Section */}
                <div className="flex gap-2">
                    {isSideMenuOpen && <MobileNav closeSideMenu={closeSideMenu} />}
                    {/* Navitems */}
                    <div className="hidden md:flex items-center gap-4 transition-all">
                        {navLinks.map((d, i) => (
                            <div key={i} className="relative group px-2 py-3 transition-all">
                                <Link to={d.to} className="flex items-center gap-2">
                                    <span>{d.title}</span>
                                    {d.submenu && (
                                        <IoIosArrowDown className="rotate-180 transition-all group-hover:rotate-0" />
                                    )}
                                </Link>

                                {/* Dropdown */}
                                {d.submenu && (
                                    <div data-aos="fade-up" className="absolute right-0 z-50 top-10 hidden w-auto flex-col gap-1 rounded-lg bg-white py-3 shadow-md transition-all group-hover:flex">
                                        {d.submenu.map((ch, i) => (
                                            <Link
                                                key={i}
                                                to={ch.to}
                                                className="flex items-center text-black py-1 pl-6 pr-8"
                                            >
                                                <span className="pl-3">{ch.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* <button className="hidden px-4 py-2 bg-[#1EA8DF] text-white font-bold rounded-full md:flex items-center gap-1"  onClick={handleDonateClick}>
                        <FaHeart />
                        Donate Now
                    </button> */}

                    {/* <select id="language" className="hidden md:flex bg-[#1EA8DF] p-2 outline-none ">
                        <option  value="english">English</option>
                        <option value="tamil">Tamil</option>
                        <option value="sinhala">Sinhala</option>
                    </select> */}
                </div>
                <FiMenu
                    className="cursor-pointer text-4xl md:hidden"
                    onClick={openSideMenu}
                />
            </div>
        </div>
    );
};

export default Navbar;
