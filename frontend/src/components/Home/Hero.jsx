import React, { useState, useEffect } from "react";
import { HeroIcon1, HeroIcon2, HeroIcon3, HeroIcon4 } from "../../assets";
import { HeroSlider } from "../../Data";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { IoIosCloseCircleOutline } from "react-icons/io";
import angadi_logo from "../../assets/mankatha_new_logo.png";

const Modal = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="relative bg-white p-2 rounded-lg">
        <button onClick={onClose} className="absolute -top-5 -right-5 text-black">
          <IoIosCloseCircleOutline className="text-white text-[30px]" />
        </button>
        <iframe
          width="560"
          height="315"
          src={videoUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prevIndex) => (prevIndex + 1) % HeroSlider.length);
  };

  const prevSlide = () => {
    setIndex((prevIndex) => (prevIndex - 1 + HeroSlider.length) % HeroSlider.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const openModal = () => {
    setVideoUrl("https://www.youtube.com/embed/uNLBDyB_OFE");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setVideoUrl("");
    setIsModalOpen(false);
  };

  return (
    <div className="w-full relative h-[100vh] md:h-[110vh]  flex ">
      {HeroSlider.map((item, i) => (
        <div
          key={i}
          className={`slide-container ${i === index ? "block" : "hidden"} flex w-full`}
        >
          <div className="w-full  h-[100vh] md:h-[110vh] relative overflow-hidden flex items-center">
            <img
              alt=""
              className=" -z-10 h-full w-full absolute zoom-in"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)),url(${item.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <img
              src={item.icon3}
              alt=""
              className="hidden md:flex absolute bg-opacity-80 left-[35px] bottom-0 w-[205px] animate-wiperAnimation"
            />
            <div className="flex flex-col w-full mt-[80px] md:mt-[130px] mb-[20px] md:mb-[200px] z-4 px-6 md:px-24">
              <div className="flex flex-col md:flex-row justify-between w-full mt-4 md:mt-0 items-stretch">
                
                {/* LEFT COLUMN: Text + Play Button + Join Us */}
                <div className="flex flex-col items-start justify-between w-full md:w-[65%] lg:w-[70%]">
                  <div className="w-full flex-col font-nunito flex animate-slideImage2">
                    <p className="font-extrabold text-[28px] md:text-[50px] lg:text-[58px] leading-[32px] md:leading-[55px] lg:leading-[65px] tracking-[-0.03em] drop-shadow-md pb-3 md:pb-6 text-white w-full">
                      {t("title")}
                      <br />
                      The Mankatha Way
                    </p>
                    <p className="font-semibold text-white/90 text-[15px] md:text-[20px] lg:text-[24px] md:leading-[31.5px] leading-[22px] tracking-[0.27px] max-w-[700px]">
                      Empowering our community through Unified Investments and Leadership
                    </p>
                    <Modal isOpen={isModalOpen} onClose={closeModal} videoUrl={videoUrl} />
                  </div>

                  {/* Play button + Join Us */}
                  <div className="flex flex-col items-start mt-4 md:mt-8">
                    <div className="flex flex-col items-center">
                      <img
                        src={HeroIcon4}
                        alt="Play Video"
                        className="w-[80px] h-[80px] md:w-auto md:h-auto p-[20px] md:p-[40px] bg-white rounded-full animate-smoothPing cursor-pointer relative z-0"
                        onClick={openModal}
                      />
                      <Link to="/Care/volunteer" className="mt-4 md:mt-6 relative z-10">
                        <button className="join-button animate-slideImage2 relative px-7 py-2 md:px-10 md:py-3 bg-[#213F96] rounded-full font-nunito font-bold text-white text-[17px] md:text-[20px] leading-[25px] md:leading-[30px] tracking-[0.5px] overflow-hidden border-2 border-white/20 shadow-xl hover:scale-105 transition-transform duration-300">
                          <span className="relative z-10">Join Us</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Mankatha Angadi - Text + Arrow + Logo */}
                <div className="flex flex-col items-center justify-between mt-8 md:mt-0 md:pt-[20px] w-full md:w-[35%] lg:w-[30%] h-full">
                  
                  {/* Top Part: Link to store with Logo and Arrow */}
                  <Link to="/mankathaspecies" className="flex flex-col items-center justify-center gap-1 md:gap-2 group cursor-pointer animate-slideImage2 hover:-translate-y-1 transition-transform flex-grow">
                    {/* Text Above Arrow */}
                    <div className="text-white font-extrabold text-[24px] md:text-[35px] mb-0 drop-shadow-lg tracking-wide whitespace-nowrap" style={{ textShadow: '2px 2px 4px #000' }}>
                      Mankatha Angadi
                    </div>
                    {/* Bouncing/Flickering Down Arrow */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                className="text-[#FF0000] animate-pulse drop-shadow-[0_0_20px_rgba(255,0,0,1)] w-[60px] h-[80px] md:w-[90px] md:h-[115px]"
                      style={{ animationDuration: '0.5s' }}
                      viewBox="0 0 24 24" preserveAspectRatio="none"
                      fill="currentColor"
                    >
                      <path d="M9 2 h6 v12 h4 L12 23 L5 14 h4 z"/>
                    </svg>
                    {/* Logo Circle Below */}
                    <div className="flex justify-center items-center">
                      <img
                        src={angadi_logo}
                        alt="Mankatha Angadi Logo"
                        className="w-[120px] h-[120px] md:w-[220px] md:h-[220px] lg:w-[250px] lg:h-[250px] object-contain drop-shadow-2xl transition-all duration-300"
                      />
                    </div>
                  </Link>

                  {/* Bottom Part: Login Button */}
                  <div className="flex flex-col items-center justify-end mt-4 md:mt-6 w-full">
                    <Link to="/mankathaspecies" className="relative z-10 w-max group">
                      <button className="bg-white px-6 py-2 md:px-8 md:py-2.5 rounded-full flex flex-col items-center justify-center shadow-xl group-hover:scale-105 border border-gray-100 group-hover:shadow-2xl transition-all duration-300 w-full whitespace-nowrap">
                        <span className="text-[9px] md:text-[12px] lg:text-[14px] font-bold text-[#8CC63F] tracking-wider uppercase leading-tight mb-0.5">
                          Click Here
                        </span>
                        <span className="text-[16px] md:text-[20px] lg:text-[24px] font-extrabold text-[#CC0000] tracking-wide leading-tight drop-shadow-sm">
                          Mankatha Angadi
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Hero;
