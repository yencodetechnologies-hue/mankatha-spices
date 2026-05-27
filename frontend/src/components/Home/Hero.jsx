import React, { useState, useEffect } from "react";
import { HeroIcon1, HeroIcon2, HeroIcon3, HeroIcon4 } from "../../assets";
import { HeroSlider } from "../../Data";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { IoIosCloseCircleOutline } from "react-icons/io";

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
    const interval = setInterval(nextSlide, 10000);
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
            <div className="flex flex-col w-full my-[200px] z-4 px-6 md:px-24">
              <div className="w-full flex flex-col">
                <div className="w-full animate-slideContent2">
                  <p className="font-nunito font-extrabold text-white text-[30px] leading-[30px] md:text-[60px] md:leading-[60px] flex flex-row w-full">
                    {t("title")}
                  </p>
                </div>
                <div>
                  <p className="font-nunito font-extrabold animate-slideContent2 flex flex-row text-white text-[30px] leading-[40px] md:text-[60px] md:leading-[60px] items-center justify-between w-full">
                    <span>The Mankatha Way</span>
                    <img
                      src={HeroIcon4}
                      alt=""
                      className="p-[44px] hidden md:flex bg-white rounded-full animate-smoothPing"
                      onClick={openModal}
                    />
                  </p>
                  <Modal isOpen={isModalOpen} onClose={closeModal} videoUrl={videoUrl} />
                </div>
                <div className="flex flex-col animate-slideContent mt-4">
                  <p className="font-rubik font-normal text-white md:text-[18px] text-[16px] md:leading-[31.5px] leading-[28px] tracking-[0.27px]">
                    Empowering our community through Unified Investments and Leadership
                  </p>
                </div>
                <div className="flex mt-8 gap-4">
                  <Link to="/Care/volunteer">
                    <button className="join-button animate-slideImage2 relative px-6 py-2 bg-[#213F96] rounded-full font-nunito font-bold text-white text-[17px] leading-[29.8px] tracking-[0.25px] overflow-hidden">
                      <span className="relative z-10">Join Us</span>
                    </button>
                  </Link>
                  <Link to="/mankathaspecies">
                    <button className="join-button animate-slideImage2 relative px-6 py-2 bg-[#8DC63F] rounded-full font-nunito font-bold text-white text-[17px] leading-[29.8px] tracking-[0.25px] overflow-hidden">
                      <span className="relative z-10">Grab Your order</span>
                    </button>
                  </Link>
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
