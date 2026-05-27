import React, { useState, useRef } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
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
		className="absolute left-[-25px] top-[50%] rounded-full bg-[#122F2A] p-2 transform -translate-y-1/2 cursor-pointer z-10"
		onClick={onClick}>
		<FaArrowLeft className="text-white text-[20px]" />
	</div>
);

const CustomNextArrow = ({ onClick }) => (
	<div
		className="absolute right-[-25px] top-[50%] rounded-full bg-[#122F2A] p-2 transform -translate-y-1/2 cursor-pointer z-10"
		onClick={onClick}>
		<FaArrowRight className="text-white text-[20px]" />
	</div>
);

const Testimonial = () => {
	const [activeSlide, setActiveSlide] = useState(0);
	const sliderRef = useRef(null);

	const settings = {
		dots: false,
		infinite: true,
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: true,
		prevArrow: <CustomPrevArrow />,
		nextArrow: <CustomNextArrow />,
		autoplay: true,
		speed: 500,
		autoplaySpeed: 2000,
		cssEase: "linear",
		beforeChange: (current, next) => setActiveSlide(next),
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
					infinite: true,
					dots: true,
				},
			},
			{
				breakpoint: 820,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
					initialSlide: 1,
				},
			},
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
				},
			},
		],
	};

	const handleImageClick = (index) => {
		sliderRef.current.slickGoTo(index);
		setActiveSlide(index);
	};

	return (
		<div className="w-full flex flex-col md:px-12 py-24 px-3 relative mt-10">
			{/* <img
					src={Testimonial_flower}
					alt=""
					className="absolute z-10 right-10 -bottom-4 hidden lg:flex md:w-[93px] lg:h-[221px] object-cover animatecss animate-wiperAnimation"
				/> */}
			<div className="flex w-full flex-col relative">
				
				<div className="w-full flex items-center justify-center gap-2 mb-18">
					<div className="flex">
						<img src={A_1_icon} alt="" />
						<img src={A_2_icon} alt="" className="animate-bounce" />
					</div>
					<p className="font-caveat text-center font-bold text-[#1EA8DF] text-[22px] leading-[22px] tracking-[2.2px]">
						OUR TESTIMONIALS
					</p>
				</div>
				<div className="w-full mb-12 relative z-1">
					<p className="font-nunito text-center font-extrabold text-[#122F2A] mt-2 text-[40px] leading-[50px] tracking-[0.33px]">
						What They’re Saying
					</p>
					<img
						src={Testimonial_hand}
						alt=""
						className="  absolute z-10 left-0 -top-10 hidden lg:flex md:w-[139px] lg:h-[255px] object-cover animate-wiperAnimation"
					/>
				</div>
				<div className="w-full h-fit md:px-24 px-6 relative">
					<div className="flex absolute -top-0 z-10 left-1/2  transform -translate-x-1/2 items-center justify-center">
						{TestimonialData.map((item, idx) => (
							<img
								key={idx}
								src={item.image}
								alt=""
								className={`w-[80px] h-[80px] cursor-pointer border-4  rounded-full  transition-all duration-300 ${
									activeSlide === idx
										? "w-[110px] h-[110px] border-4 border-[#1EA8DF]"
										: ""
								}`}
								onClick={() => handleImageClick(idx)}
							/>
						))}
					</div>
					<Slider {...settings} ref={sliderRef} className="custom-slider2">
						{TestimonialData.map((item, index) => (
							<div
								id="Slider-Boxes"
								key={index}
								className="p-8 mt-10 w-full bg-white flex flex-row border   rounded-[80px] border-[#DDDDDD] relative py-12">
								<div className="flex flex-col w-full  gap-1">
									<p className="font-nunito text-center mt-2 text-[24px] font-extrabold text-[#122F2A]">
										{item.name}
									</p>
									{/* <p className="font-rubik text-center text-[16px] font-normal mt-4 text-[#636363]">
										{item.position}
									</p> */}
									<p className="font-rubik text-center text-[16px] font-normal px-[] mt-4 text-[#636363]">
										{item.Description}
									</p>
									<div className="flex w-full items-center text-[20px] justify-center py-4">
										<div className="h-[21px]"></div>
									</div>
								</div>
							</div>
						))}
					</Slider>

					
				</div>
			</div>
		</div>
	);
};

export default Testimonial;
