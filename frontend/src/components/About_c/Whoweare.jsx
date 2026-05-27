 
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
 
import {
	about_1,
	about_2,
	about_3,
	about_4,
	A_1_icon,
	A_2_icon,
	Gallery_img5,
} from "../../assets";
import { motion } from "framer-motion";

const Whoweare = () => {
	 
	const navigate = useNavigate();
    const handleDonateClick = () => {
        navigate("/Careerr");
    };
	return (
		<div className="w-full md:px-24 px-6 py-12">
			<div className="grid md:grid-cols-2 ">
				{/* 1st div */}
				<div className="w-full py-12 relative">
					<img src={Gallery_img5} alt="" className="w-full object-cover h-full p-[20px] " />
					<img
						src={about_3}
						alt=""
						className="hidden md:flex absolute bottom-4 animate-pulse-slow animate__infinite -left-6  -z-10"
					/>
				</div>
				{/* 2nd div */}
				<div className="w-full py-12 relative md:pl-6">
					{/* ----------------------------------------------------------------- */}
					<div className="flex  items-center ">
						<div className="flex items-center ">
							<img src={A_1_icon} alt="" />
							<img src={A_2_icon} alt="" className="animate-bounce" />
						</div>

						<p className="font-caveat font-bold text-[#1EA8DF]  text-[22px] leading-[22px] tracking-[2.2px]">
							WHO WE ARE
						</p>
					</div>
					{/* ----------------------------------------------------------------- */}
					<div className="flex w-full">
						<motion.p
							initial={{ x: 100, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
							transition={{
								delay: 0.2,
								x: { type: "spring", stiffness: 60 },
								opacity: { duration: 0.6 },
								ease: "easeIn",
								duration: 0.3,
							}}
							className="font-nunito font-bold text-[#122F2A] text-[32px] md:text-[40px] leading-[50px] mt-[16px]">
							Welcome to Mangatha Pvt Ltd.
						</motion.p>
					</div>

					{/* <div className="mt-8 h-[2px] bg-[#DDDDDD] w-full relative">
                               <div className="w-[10px] top-[-4px] h-[10px] rounded-full bg-Orange absolute  animate-moveLeftRight">

							   </div>
							</div> */}
					{/* ----------------------------------------------------------------- */}
					<div className="flex w-full">
						<motion.p
							initial={{ x: 100, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
							transition={{
								delay: 0.6,
								x: { type: "spring", stiffness: 60 },
								opacity: { duration: 1 },
								ease: "easeIn",
								duration: 0.6,
							}}
							className="font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-[16px]">
							At Mangatha Pvt Ltd, we are dedicated to building a
							self-sufficient and prosperous community in Valvettithurai. Founded
							on the principles of unity, professional administration, and
							strong leadership, our mission is to drive significant social
							value and trust within our community.
						</motion.p>
					</div>
					<div className="flex w-full flex-col">
						<p className="font-nunito font-bold text-[#122F2A] text-[18px] md:text-[24px] leading-[20px] mt-[16px]">
							Our Mission
						</p>
						<motion.p
							initial={{ x: 100, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
							transition={{
								delay: 0.6,
								x: { type: "spring", stiffness: 60 },
								opacity: { duration: 1 },
								ease: "easeIn",
								duration: 0.6,
							}}
							className="font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-[16px]">
							Our mission is to unite micro-investors, foster
							professional administration, and nurture strong community leaders.
							Through these efforts, we aim to create a robust business model
							that not only generates economic growth but also uplifts and
							empowers every member of our community.
						</motion.p>
					</div>
					<div className="flex w-full flex-col">
						<p className="font-nunito font-bold text-[#122F2A] text-[18px] md:text-[24px] leading-[20px] mt-[16px]">
							Our Vision
						</p>
						<motion.p
							initial={{ x: 100, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
							transition={{
								delay: 0.6,
								x: { type: "spring", stiffness: 60 },
								opacity: { duration: 1 },
								ease: "easeIn",
								duration: 0.6,
							}}
							className="font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-[16px]">
							We envision a future where every member of our community is
							empowered to thrive. By fostering a culture of trust,
							collaboration, and innovation, we strive to build a resilient
							community that sets a new standard for community development.
						</motion.p>
					</div>
					{/* ----------------------------------------------------------------- */}
					<div className="flex"></div>
					{/* ----------------------------------------------------------------- */}
					{/* <div className="mb-0 flex flex-col">
						<p className="flex gap-2 font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-[16px]">
							{" "}
							<img src={about_4} alt="" /> We help companies develop powerful
							corporate social Responsibility,
						</p>
						<p className="flex gap-2 font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-[16px]">
							{" "}
							<img src={about_4} alt="" /> No matter what you you have.
						</p>
						<p className="flex gap-2 font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-[16px]">
							{" "}
							<img src={about_4} alt="" /> Helped fund 3,265 Project powerful
							corporate poor.
						</p>
					</div> */}
					{/* ----------------------------------------------------------------- */}
				</div>
			</div>
			<div className="flex flex-col md:flex-row  w-full mt-5 items-center justify-center gap-4">
				<p className="font-caveat font-bold text-[#122f2A]  text-[22px] gap-2 leading-[22px]  ">
					<span className="font-caveat font-bold text-[#213F96]  text-[22px] mr-2 ">
						#
					</span>
					Join us in building a thriving, self-sufficient community!
				</p>{" "}
				 
					<button className="px-8 py-1 text-white text-[20px] font-nunito bg-[#213F96] rounded-full" onClick={handleDonateClick}>
						Join now
					</button>
				 
			</div>
		</div>
	);
};

export default Whoweare;
