import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { SlCalender } from "react-icons/sl";
import { FaFolder } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaPinterest } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";

import {
	about_4,
	about_5,
	about_1,
	About_icon1,
	About_icon2,
	About_icon3,
	A_1_icon,
	A_2_icon,
	Progress_img1,
	Progress_img2,
	Adminstration,
	organization,
	community,
	investor,
	leadership,
	self,
	man1,
} from "../../assets";
const Ourstory = () => {
	const navigate = useNavigate();
    const handleDonateClick = () => {
        navigate("/Careerr");
    };
	return (
		<div className="w-full flex flex-col md:px-24 px-6 pt-12 pb-24">
			<div className="flex justify-center py-12 gap-2  ">
				<div className="flex items-center ">
					<img src={A_1_icon} alt="" />
					<img src={A_2_icon} alt="" className="animate-bounce" />
				</div>

				<p className="font-caveat font-bold text-[#1EA8DF]   text-[22px] leading-[22px] tracking-[2.2px]">
					WHY CHOOSE US?
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3  gap-4 w-full ">
				{/* div1 */}
				<div className="w-full  md:col-span-2     flex-col">
					{/* <div className="flex 	 overflow-hidden">
						<img
							src={about_5}
							alt=""
							className="w-full h-[300px] object-cover rounded-md"
						/>
					</div>
					<div className="w-full bg-[#F1F6F7] py-6 px-6">
						<div className="skill-box my-6">
							<div className="skill-bar mt-2 w-full h-2 bg-gray-300 rounded-lg">
								<span
									className="skill-per html relative block h-full bg-[#1EA8DF] rounded-lg"
									style={{ width: "85%" }}>
									<span className="tooltip absolute right-[-14px] top-[-40px] text-xs font-medium text-white bg-[#1EA8DF]  py-1 px-2 rounded-md">
										85%
									</span>
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="title block text-base font-semibold text-green2">
									$13,000 Goals
								</span>
								<span className="title block text-base font-semibold text-green2">
									$5,000 Donate
								</span>
							</div>
							<div className="mt-8 h-[2px] bg-[#DDDDDD] w-full relative">
								<div className="w-[10px] top-[-4px] h-[10px] rounded-full bg-[#1EA8DF]  absolute  animate-bounce-horizontal2"></div>
							</div>
							<div className="flex items-center justify-center py-6 ">
								<button className="px-8 py-2 bg-[#213F96]  font-nunito  rounded-full font-normal text-[#ffffff] text-[16px] leading-[28px] " onClick={handleDonateClick}>
									Join Now
								</button>
							</div>
						</div>
					</div> */}
					<div className="flex mt-4 flex-col">
						<div className="mb-0 flex flex-col">
							<p className="flex  flex-col font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] ">
								{" "}
								<p className="flex gap-2 font-nunito font-extrabold text-[#122f2A]  text-[20px] leading-[28px] text-left ">
									<img src={about_4} alt="" /> Unified Investments
								</p>
								<p className="flex px-5">
									<p>
										We bring together micro-investors to create a unified
										platform for growth and development.
									</p>{" "}
								</p>
							</p>
							<p className="flex  flex-col font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-[16px]">
								{" "}
								<p className="flex gap-2 font-nunito font-extrabold text-[#122f2A]  text-[20px] leading-[28px] text-left">
									<img src={about_4} alt="" /> Professional Administration
								</p>
								<p className="flex px-5">
									<p>
										Our commitment to professional standards ensures efficient
										and effective management of resources.
									</p>{" "}
								</p>
							</p>
							<p className="flex  flex-col font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-[16px]">
								{" "}
								<p className="flex gap-2 font-nunito font-extrabold text-[#122f2A]  text-[20px] leading-[28px] text-left ">
									<img src={about_4} alt="" /> Strong Community Leadership
								</p>
								<p className="flex px-5">
									<p>
										We nurture and develop strong leaders who are dedicated to
										the success and well-being of our community.
									</p>{" "}
								</p>
							</p>
						</div>

						{/* <p className="font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] text-justify">
							Poor address a range of simply application and infrastructure this
							of passages of available, but the majority have suffered poor in
							some form.Lorem Ipsum is simply dummy text of the printing and
							industry has been the industry’s standard dummy text ever since
							the 1500s, when this poor man an unknown printer took a galley of
							type and scrambled it to make a type specimen book. It has
							survived not only five centuries, but also the leap into
							electronic typesetting, remaining essentially unchanged. It was
							popularised in the 1960s with the release of Letraset sheets
							containing Lorem Ipsum passages, and more recently with desktop.
						</p> */}
					</div>

					<div className="flex mt-4">
						<p className="font-nunito font-extrabold text-[#122f2A]  text-[40px] leading-[48px] text-left">
							Our Core Values
						</p>
					</div>
					<div className="flex mt-4">
						<p className="font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] text-justify">
							At Mangatha Pvt Ltd, we understand that the true value of seamless
							coordination extends beyond financial profits. It encompasses the
							significant social value that we aim to create and uphold within
							our community.
						</p>
					</div>
					<div className="flex flex-col">
						<div className="grid md:grid-cols-2 gap-6 mt-8">
							<div className=" flex flex-cols-2  gap-4 items-center ">
								<div>
									<div className=" bg-Orange p-3 rotate-45 rounded-t-[13px] rounded-r-[16px] rounded-b-[13px] rounded-l-[16px]">
										<img
											src={Adminstration}
											alt=""
											className="w-[30px] h-[30px] -rotate-45"
										/>
									</div>
								</div>
								<div>
									{" "}
									<p className="font-nunito font-extrabold text-[#122F2A] text-[20px]  leading-[20px]  ">
										Professional Administration
									</p>
								</div>
							</div>
							<div className=" flex flex-cols-2 gap-4 items-center ">
								<div>
									<div className=" bg-[#ffa415] p-3 rotate-45 rounded-t-[13px] rounded-r-[16px] rounded-b-[13px] rounded-l-[16px]">
										<img
											src={investor}
											alt=""
											className="w-[30px] h-[30px] -rotate-45"
										/>
									</div>
								</div>
								<div>
									{" "}
									<p className="font-nunito font-extrabold text-[#122F2A] text-[20px]  leading-[20px]  ">
										Unified Micro-Investors{" "}
									</p>
								</div>
							</div>
							<div className=" flex flex-cols-2  gap-4 items-center ">
								<div>
									<div className=" bg-[#8139e7] p-3 rotate-45 rounded-t-[13px] rounded-r-[16px] rounded-b-[13px] rounded-l-[16px]">
										<img
											src={community}
											alt=""
											className="w-[30px] h-[30px] -rotate-45"
										/>
									</div>
								</div>
								<div>
									{" "}
									<p className="font-nunito font-extrabold text-[#122F2A] text-[20px]  leading-[20px]  ">
										Community Engagement
									</p>
								</div>
							</div>
							<div className=" flex flex-cols-2 gap-4 items-center ">
								<div>
									<div className=" bg-[#44c895] p-3 rotate-45 rounded-t-[13px] rounded-r-[16px] rounded-b-[13px] rounded-l-[16px]">
										<img
											src={organization}
											alt=""
											className="w-[30px] h-[30px] -rotate-45"
										/>
									</div>
								</div>
								<div>
									{" "}
									<p className="font-nunito font-extrabold text-[#122F2A] text-[20px]  leading-[20px]  ">
										Consolidation of Resources
									</p>
								</div>
							</div>
							<div className=" flex flex-cols-2  gap-4 items-center ">
								<div>
									<div className=" bg-Orange p-3 rotate-45 rounded-t-[13px] rounded-r-[16px] rounded-b-[13px] rounded-l-[16px]">
										<img
											src={self}
											alt=""
											className="w-[30px] h-[30px] -rotate-45"
										/>
									</div>
								</div>
								<div>
									{" "}
									<p className="font-nunito font-extrabold text-[#122F2A] text-[20px]  leading-[20px]  ">
										Self-Sufficiency
									</p>
								</div>
							</div>
							<div className=" flex flex-cols-2 gap-4 items-center ">
								<div>
									<div className=" bg-[#ffa415]  p-3 rotate-45 rounded-t-[13px] rounded-r-[16px] rounded-b-[13px] rounded-l-[16px]">
										<img
											src={leadership}
											alt=""
											className="w-[30px] h-[30px] -rotate-45"
										/>
									</div>
								</div>
								<div>
									{" "}
									<p className="font-nunito font-extrabold text-[#122F2A] text-[20px]  leading-[20px]  ">
										Leadership Development
									</p>
								</div>
							</div>
						</div>
					</div>

					<div></div>
				</div>

				{/* div2 */}
				<div className=" w-full   flex flex-col ">
					{/* <div className="w-full bg-[#1EA8DF] rounded-md flex ">
						<div className=" w-full rounded-md bg-[#F1F6F7] mt-2  py-6">
							<div className="flex flex-col w-full gap-4">
								<div className="flex flex-col items-center justify-center gap-3 px-[15px] pb-2 border-b-2">
									<img
										src={About_icon3}
										alt=""
										className=" object-cover w-[50px] h-[50px]"
									/>
									<p className="font-nunito font-extrabold text-[#122F2A] text-[18px] leading-[21px] ">
										Join Our Team
									</p>
									<p className="font-caveat font-bold text-[#FFA415] text-[26px] leading-[26px] tracking-[2.2px]">
										5,472
									</p>
								</div>
								<div className="flex flex-col items-center justify-center gap-3 px-[15px] pb-2 border-b-2">
									<img
										src={About_icon2}
										alt=""
										className=" object-cover w-[50px] h-[50px]"
									/>
									<p className="font-nunito font-extrabold text-[#122F2A] text-[18px] leading-[21px] ">
										Donate Now
									</p>
									<p className="font-caveat font-bold text-Orange text-[26px] leading-[26px] tracking-[2.2px]">
										$30,768
									</p>
								</div>
								<div className="flex flex-col items-center justify-center gap-3 px-[15px] pb-2 ">
									<img
										src={About_icon1}
										alt=""
										className=" object-cover w-[50px] h-[50px]"
									/>
									<p className="font-nunito font-extrabold text-[#122F2A] text-[18px] leading-[21px] ">
										Total Fund Raised
									</p>
									<p className="font-caveat font-bold text-[#8742E8] text-[26px] leading-[26px] ">
										1,193,210
									</p>
								</div>
							</div>
						</div>
					</div> */}
					<div className="w-full bg-[#1EA8DF] rounded-md flex ">
						<div className=" w-full rounded-md bg-[#F1F6F7] mt-2  py-6">
							<div className="flex flex-col w-ful items-center justify-centerl">
								<div>
									<p className="font-nunito font-extrabold text-[#122F2A]  text-[24px] leading-[28px]  ">
										Share Causes to Follow US
									</p>
								</div>
								<div className="flex mt-4 gap-4 py-4 items-center">
									<div className="flex items-center justify-center bg-white rounded-full w-[42px] h-[42px]">
										<FaFacebookF />
									</div>
									<div className="flex items-center justify-center bg-white rounded-full w-[42px] h-[42px]">
										<FaInstagram />
									</div>
									<div className="flex items-center justify-center bg-white rounded-full w-[42px] h-[42px]">
										<FaPinterest />
									</div>
									<div className="flex items-center justify-center bg-white rounded-full w-[42px] h-[42px]">
										<IoLogoYoutube />
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="flex flex-col mt-8">
						<div>
							<img src={Progress_img2} alt="" className=" object-cover" />
						</div>

						<div className="flex items-center justify-center py-6 ">
							<Link to="/volunteer">
								<button className="px-8 py-2 bg-[#213F96]  font-nunito  rounded-full font-normal text-[#ffffff] text-[16px] leading-[28px] " onClick={handleDonateClick}>
									Join Now
								</button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Ourstory;
