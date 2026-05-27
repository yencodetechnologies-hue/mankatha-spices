import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { A_1_icon, A_2_icon } from "../../assets";
import { clients } from "../../Data";
const Partners = () => {
	var settings = {
		dots: false,
		infinite: true,
		slidesToShow: 4,
		slidesToScroll: 1,
		arrows: false,
		autoplay: true,
		speed: 2000,
		autoplaySpeed: 2000,
		cssEase: "linear",
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 4,
					slidesToScroll: 3,
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
	return (
		<div className="md:px-12 px-6 border-b border-b-[#DDDDDD]  pt-14 pb-14flex flex-col h-full w-full items-center justify-center relative ">
			<div className="w-full h-fit ">
				<div className="w-full flex text-center items-center justify-center gap-2 mb-4">
					<div className="flex  ">
						<img src={A_1_icon} alt="" />
						<img src={A_2_icon} alt="" className="animate-bounce" />
					</div>
					<p className="font-caveat font-bold text-Orange text-center  text-[22px] leading-[22px] tracking-[2.2px] ">
						OUR PARTNERS
					</p>
				</div>
				<Slider {...settings} className="custom-slider">
					{clients.map((item, index) => (
						<div
							id="Slider-Boxes"
							key={index}
							className="p-4 mt-4 min-w-[full] bg-white flex flex-col">
							<img src={item.image} alt="" className="opacity-[90%]" />
						</div>
					))}
				</Slider>
			</div>
		</div>
	);
};

export default Partners;
