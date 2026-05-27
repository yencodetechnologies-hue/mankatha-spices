import React, { useEffect, useState } from "react";
import { TeamData } from "../../Data";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import {
	about_1,
	about_2,
	about_3,
	about_4,
	A_1_icon,
	A_2_icon,
	About_man,
	About_man1,
	About_man2,
	About_man3,
	About_man4,
	About_man5,
	About_man6,
} from "../../assets";

const Team = () => {
	var settings = {
		dots: true,
		infinite: true,
		slidesToShow: 3,
		slidesToScroll: 1,
		arrows: false,
		autoplay: true,
		speed: 4000,
		autoplaySpeed: 4000,
		cssEase: "linear",
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 3,
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
	return (
		<div className="w-full md:px-24 px-6 flex flex-col items-center justify-center py-12">
			<div className="flex items-center gap-2">
				<div className="flex items-center ">
					<img src={A_1_icon} alt="" />
					<img src={A_2_icon} alt="" className="animate-bounce" />
				</div>
				<p className="font-caveat font-bold text-[#1EA8DF] text-[22px] leading-[22px] tracking-[2.2px]">
					OUR EXPERT TEAM
				</p>
			</div>
			<div className="flex w-full justify-center">
				<p className="font-nunito font-bold text-[#122F2A] text-[32px] md:text-[40px] leading-[50px] mt-[16px]">
					Meet The Team Member
				</p>
			</div>
			<div className="w-full  h-fit mt-8 ">
				<Slider {...settings} className="custom-slider">
					{TeamData.map((item, index) => (
						<div className=" z-10 flex relative flex-col  items-center boxShadow3 bg-[#F1F6F7]   justify-center">
							
							
								<img
									src={item.image}
									alt=""
									className="h-[300px] rounded-br-[150px] border-b- border-b-white absolute   w-full object-cover "

								/>
							
							<div className="flex flex-col text-center items-center justify-center ">
								<p className="font-nunito font-bold text-[#122F2A] text-[18px] md:text-[20px] leading-[20px] mt-[320px]">
									{item.name}
								</p>
								<p className="font-rubik font-normal text-[#636363]  text-[14px] leading-[20px] mt-[16px]  h-[80px] ">
									{item.position}
								</p>
							</div>
						</div>
					))}
				</Slider>
			</div>
		</div>
	);
};

export default Team;
