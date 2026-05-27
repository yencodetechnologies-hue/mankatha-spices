import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosCloseCircleOutline } from "react-icons/io";
import {
	Progress_Arrow_img,
	A_1_icon,
	A_2_icon,
	About_mimg,
	About_Simg,
	About_S2img,
	About_S3img,
	About_icon1,
	About_icon2,
	About_icon3,
	About_icon4,
	About_sign,
	About_man,
} from "../../assets";
import { delay, motion } from "framer-motion";

const Modal = ({ isOpen, onClose, videoUrl }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 ">
			<div className="relative  p-2 rounded-lg flex w-full ">
				<div className="flex w-full items-center justify-center relative mx-6 sm:mx-0 ">
					<div className="w-full relative md:w-[530px] z-50">
						<button
							onClick={onClose}
							className="absolute -top-5 -right-5 text-black">
							<IoIosCloseCircleOutline className="text-white text-[30px]" />
						</button>
						<iframe
							className="w-full"
							height="315"
							src={videoUrl}
							title="YouTube video player"
							frameBorder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							referrerPolicy="strict-origin-when-cross-origin"
							allowFullScreen></iframe>
					</div>
				</div>
			</div>
		</div>
	);
};

const Home_About = () => {
	const navigate = useNavigate();
	const handleDonateClick = () => {
		navigate("/about");
	};
	const handleDonateClick2 = () => {
		navigate("/volunteer");
	};
	const handleDonateClick3 = () => {
		navigate("/Careerr");
	};
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [videoUrl, setVideoUrl] = useState("");
	const openModal = () => {
		setVideoUrl("https://www.youtube.com/embed/eRBkr3NN2-E?si=LxRtNKkNQLCvwOj7");
		setIsModalOpen(true);
	  };
	  
	  const closeModal = () => {
		setVideoUrl("");
		setIsModalOpen(false);
	  };
	return (
		<div className="w-full flex flex-col sm:px-24 px-3 my-24 items-center justify-center">
			<div className="w-full grid md:grid-cols-2">
				{/* 1st div */}
				<div className="relative flex sm:pl-[100px] sm:pr-[10px]  py">
					<motion.img
						initial={{ x: -100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{
							delay: 0.2,
							x: { type: "spring", stiffness: 60 },
							opacity: { duration: 1 },
							ease: "easeIn",
							duration: 1,
						}}
						src={About_mimg}
						alt=""
						className=" object-cover w-full h-[500px] md:h-full opacity-80 rounded-[30px]  "
					/>

					<div className="hidden md:flex absolute border-10 border-white top-[80px] animate-bounce-slow -left-[4px]">
						<img src={About_Simg} alt="" className=" object-cover" />
					</div>
					<div className="hidden md:flex -z-10 absolute border-10 animate-bounce-slow top-[310px] -left-[4px]">
						<img src={About_S2img} alt="" className="" />
					</div>
					<div className="hidden md:flex -z-10 absolute border-10 animate-pulse-slow animate__infinite -bottom-[10px] left-[50px]">
						<img src={About_S3img} alt="" className="" />
					</div>
					<div className=" flex flex-cols-2 z-1 absolute  bottom-0 right-0 sm:right-[10px]">
						<div className="Flex items-center justify-center bg-[#213F96] p-[16px]">
							<img src={About_icon4} alt=""   onClick={openModal} />
							<Modal isOpen={isModalOpen} onClose={closeModal} videoUrl={videoUrl} />
							
						</div>
						
						<div className="Flex items-center justify-center bg-[#1EA8DF] p-[16px] rounded-br-[30px]">
							<p className="font-caveat font-bold text-white text-[22px] leading-[24px] tracking-[2.2px]">
								Our Story
							</p>
						</div>
					</div>
				</div>

				{/* 2nd div */}
				<div className="flex flex-col px-[15px] mt-24 md:mt-0 ">
					<motion.div
						initial={{ x: 100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{
							delay: 0.2,
							x: { type: "spring", stiffness: 60 },
							opacity: { duration: 0.6 },
							ease: "easeIn",
							duration: 1,
						}}
						className="flex w-full gap-2 ">
						<div className="flex  ">
							<img src={A_1_icon} alt="" />
							<img src={A_2_icon} alt="" className="animate-bounce" />
						</div>

						<p className="font-caveat font-bold text-[#1EA8DF]  text-[22px] leading-[22px] tracking-[2.2px]">
							ABOUT US
						</p>
					</motion.div>

					<div className="flex w-full">
						<motion.p
							initial={{ x: 100, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{
								delay: 0.5,
								x: { type: "spring", stiffness: 60 },
								opacity: { duration: 0.6 },
								ease: "easeIn",
							}}
							className="font-nunito font-bold text-[#122F2A] text-[32px] md:text-[40px] leading-[50px] mt-[16px]">
							Building a Self-Sufficient Community
						</motion.p>
					</div>
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
							At Mangatha Pvt Ltd, We are dedicated to creating a
							self-sufficient business model that unites micro-investors,
							fosters professional administration, and nurtures strong community
							leaders, driving significant social value and trust within our
							community.
						</motion.p>
					</div>
					<motion.div
						initial={{ x: 100, opacity: 0 }}
						whileInView={{ x: 0, opacity: 1 }}
						transition={{
							delay: 0.2,
							x: { type: "spring", stiffness: 60 },
							opacity: { duration: 1 },
							ease: "easeIn",
							duration: 0.3,
						}}
						className="grid grid-cols-2  ss:grid-cols-3 mt-2 w-full justify-between py-5 border-b gap-6 border-b-[#DDDDDD] ">
						<div className="flex flex-col items-center justify-center gap-3 px-[15px]">
							<img
								src={About_icon1}
								alt=""
								className=" object-cover w-[50px] h-[50px]"
							/>
							<p className="font-nunito items-center justify-center flex gap-2 font-extrabold text-[#122F2A] text-[14px] leading-[21px] ">
								Find more 
								<div
								className="flex items-center justify-center bg-[#1EA8DF] rounded-full w-[18px] h-[18px] "
								onClick={handleDonateClick}>
								<img
									src={Progress_Arrow_img}
									alt=""
									className=" hover:-rotate-[20] w-[10px]  "
								/>
							</div>
							</p>

							
						</div>
						<div className="flex flex-col items-center justify-center gap-3 px-[15px]">
							<img
								src={About_icon2}
								alt=""
								className=" object-cover w-[50px] h-[50px]"
							/>
							<p className="font-nunito items-center justify-center flex gap-2 font-extrabold text-[#122F2A] text-[14px] leading-[21px] ">
								Join our crew<div
								className="flex items-center justify-center bg-[#8742E8] rounded-full w-[18px] h-[18px] "
								onClick={handleDonateClick2}>
								<img
									src={Progress_Arrow_img}
									alt=""
									className=" hover:-rotate-[20] w-[10px]  "
								/>
							</div>
								
							</p>
							
						</div>
						<div className="flex flex-col items-center justify-center gap-3 px-[15px]">
							<img
								src={About_icon3}
								alt=""
								className=" object-cover w-[50px] h-[50px]"
							/>
							<p className=" flex font-nunito items-center justify-center font-extrabold text-[#122F2A] gap-2 text-[14px] leading-[21px] ">
								Get involved{" "}
								<div
								className="flex items-center justify-center bg-[#213F96] rounded-full w-[18px] h-[18px] "
								onClick={handleDonateClick3}>
								<img
									src={Progress_Arrow_img}
									alt=""
									className=" hover:-rotate-[20] w-[10px]  "
								/>
							</div>
								 
							</p>
							
						</div>
					</motion.div>
					<motion.div
						initial={{ x: 100, opacity: 0 }}
						whileInView={{ x: 0, opacity: 1 }}
						transition={{
							delay: 0.2,
							x: { type: "spring", stiffness: 60 },
							opacity: { duration: 1 },
							ease: "easeIn",
							duration: 0.1,
						}}
						className="flex flex-cols-2 my-5 items-center justify-between ">
						<div className="flex flex-cols-2 gap-3 items-center justify-center ">
							<div className="flex  rounded-full border-dotted border-2 border-[#1EA8DF] p-1 ">
								<img
									src={About_man}
									alt=""
									className=" w-[80px] h-[80px] object-cover rounded-full"
								/>
							</div>
							<div className="flex flex-col ">
								<p className="font-nunito font-extrabold text-[#122F2A] text-[24px] leading-[28.4px] tracking-[0.33px]">
									Thevarajah Gnanaraj
								</p>
								<p className="font-rubik font-normal text-[#122F2A] text-[16px] leading-[28px] ">
									Founder
								</p>
							</div>
						</div>
						{/* <div>
							<img src={About_sign} alt="" />
						</div> */}
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default Home_About;
