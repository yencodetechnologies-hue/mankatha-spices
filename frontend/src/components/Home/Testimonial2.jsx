import React, { useState, useRef, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {
    A_1_icon,
    A_2_icon,
    Testimonial_hand,
} from "../../assets"; // Ensure these paths are correct
import { TestimonialData } from "../../Data"; // Ensure this is correctly imported

// Custom Arrows
const CustomPrevArrow = ({ onClick }) => (
    <div
        className="absolute left-[0px] top-[50%] md:left-[96px] rounded-full bg-[#122F2A] p-2 transform -translate-y-1/2 cursor-pointer z-10"
        onClick={onClick}>
        <FaArrowLeft className="text-white text-[20px]" />
    </div>
);

const CustomNextArrow = ({ onClick }) => (
    <div
        className="absolute right-[0px] md:right-[96px] top-[50%] rounded-full bg-[#122F2A] p-2 transform -translate-y-1/2 cursor-pointer z-10"
        onClick={onClick}>
        <FaArrowRight className="text-white text-[20px]" />
    </div>
);

const Testimonial2 = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const sliderRef = useRef(null);

    const nextSlide = () => {
        setActiveSlide((prevSlide) => (prevSlide === TestimonialData.length - 1 ? 0 : prevSlide + 1));
    };

    const prevSlide = () => {
        setActiveSlide((prevSlide) => (prevSlide === 0 ? TestimonialData.length - 1 : prevSlide - 1));
    };

    const handleImageClick = (index) => {
        setActiveSlide(index);
    };

    useEffect(() => {
        const slider = sliderRef.current;
        slider.style.transform = `translateX(-${activeSlide * 100}%)`;

        // Autoplay functionality
        const autoplay = setInterval(nextSlide, 10000); // Change slide every 10 seconds

        // Clear interval on component unmount
        return () => clearInterval(autoplay);
    }, [activeSlide]);

    return (
        <div className="w-full flex flex-col md:px-12 pt-12 pb-24 px-3 relative mt-10">
            <div className="flex w-full flex-col relative">
                <div className="w-full flex items-center justify-center gap-2 mb-18">
                    <div className="flex">
                        <img src={A_1_icon} alt="" />
                        <img src={A_2_icon} alt="" className="animate-bounce" />
                    </div>
                    <p className="font-caveat text-center font-bold text-[#1EA8DF] text-[22px] leading-[22px] tracking-[2.2px]">
                        TESTIMONIALS
                    </p>
                </div>
                <div className="w-full mb-12 relative z-1">
                    <p className="font-nunito text-center font-extrabold text-[#122F2A] mt-6 text-[40px] leading-[50px] tracking-[0.33px]">
                        What They’re Saying
                    </p>
                    <img
                        src={Testimonial_hand}
                        alt=""
                        className="absolute z-10 -left-8 -top-10 hidden lg:flex md:w-[139px] lg:h-[255px] object-cover animate-wiperAnimation"
                    />
                </div>
                <div className="flex relative flex-col px-6 md:px-24">
                    <div className="flex absolute -top-4 z-10 left-1/2 transform -translate-x-1/2 items-center justify-center">
                        {TestimonialData.map((item, idx) => (
                            <img
                                key={idx}
                                src={item.image}
                                alt=""
                                className={`w-[80px] h-[80px] cursor-pointer border-4 rounded-full transition-all duration-300 ${
                                    activeSlide === idx
                                        ? "w-[110px] h-[110px] border-4 border-[#1EA8DF]"
                                        : ""
                                }`}
                                onClick={() => handleImageClick(idx)}
                            />
                        ))}
                    </div>

                    <CustomPrevArrow onClick={prevSlide} className />
                    <CustomNextArrow onClick={nextSlide} />
                    <div className="relative w-full overflow-hidden">
                        <div
                            ref={sliderRef}
                            className="flex transition-transform duration-500">
                            {TestimonialData.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-8 w-full flex-shrink-0 flex flex-row border rounded-[80px] border-[#DDDDDD] relative py-12"
                                    style={{ minWidth: "100%" }}>
                                    <div className="flex flex-col w-full gap-1">
                                        <p className="font-nunito text-center mt-8 text-[24px] font-extrabold text-[#122F2A]">
                                            {item.name}
                                        </p>
                                        <p className="font-rubik text-center text-[16px] font-normal mt-4 text-[#636363]">
                                            {item.Description}
                                        </p>
                                        <div className="flex w-full items-center text-[20px] justify-center py-4">
                                            <div className="h-[21px]"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonial2;
