import React, { useRef, useState } from "react";
import { FiPhoneCall } from "react-icons/fi";
import {
	about_1,
	about_2,
	about_3,
	about_4,
	Hero_imgb1,
	A_1_icon,
	A_2_icon,
	About_S3img,
	About_mimg,
	About_icon4,
	About_S2img,
	About_Simg,
	contact_img2,
	contact_img3,
} from "../../assets";
import { motion } from "framer-motion";
import { IoIosCloseCircleOutline } from "react-icons/io";

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

const Contact_form = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [videoUrl, setVideoUrl] = useState("");
	const openModal = () => {
		setVideoUrl(
			"https://www.youtube.com/embed/eRBkr3NN2-E?si=LxRtNKkNQLCvwOj7"
		);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setVideoUrl("");
		setIsModalOpen(false);
	};
	const [successMessage, setSuccessMessage] = useState(null);
	const formRef = useRef(null);

	const handleSubmit = (e) => {
		e.preventDefault();

		fetch(
			"https://script.google.com/macros/s/AKfycbwVtvTc7VktWq0H6CYffT6xnO0sit_xM_X8ALDyHQBcv3PATSlIoI3odfK4ls61Sl82xg/exec",
			{
				method: "POST",
				body: new FormData(formRef.current),
			}
		)
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				setSuccessMessage(data.msg || "Form submitted successfully.");
				alert(data.msg || "Form submitted successfully.");
				formRef.current.reset(); // Clear the form data
			})
			.catch((err) => console.log(err));
	};

	return (
		<div className="w-full md:px-24 px-6 py-24">
			<div className="grid md:grid-cols-2 gap-8 ">
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
						src={contact_img2}
						alt=""
						className=" object-cover w-full h-full opacity-80 rounded-[30px]  "
					/>

					<div className="hidden md:flex absolute border-10 border-white top-[80px] animate-bounce-slow -left-[4px]">
						<img
							src={contact_img3}
							alt=""
							className=" object-cover h-[200px] w-[200px] rounded-xl border-8"
						/>
					</div>
					<div className="hidden md:flex -z-10 absolute border-10 animate-bounce-slow top-[310px] -left-[4px]">
						<img src={About_S2img} alt="" className="" />
					</div>
					<div className="hidden md:flex -z-10 absolute border-10 animate-pulse-slow animate__infinite -bottom-[10px] left-[50px]">
						<img src={About_S3img} alt="" className="" />
					</div>
					<div className=" flex flex-cols-2 z-1 absolute  bottom-0 right-0 sm:right-[10px]">
						<div className="Flex items-center justify-center bg-[#213F96] p-[16px]">
							<img src={About_icon4} alt="" onClick={openModal} />
							<Modal
								isOpen={isModalOpen}
								onClose={closeModal}
								videoUrl={videoUrl}
							/>
						</div>
						<div className="Flex items-center justify-center bg-[#1EA8DF] p-[16px] rounded-br-[30px]">
							<p className="font-caveat font-bold text-white text-[22px] leading-[24px] tracking-[2.2px]">
								Our Story
							</p>
						</div>
					</div>
				</div>

				<div>
					<div>
						<div className="flex  items-center gap-1 ">
							<div className="flex items-center ">
								<img src={A_1_icon} alt="" />
								<img src={A_2_icon} alt="" className="animate-bounce" />
							</div>

							<p className="font-caveat font-bold text-[#1EA8DF]  text-[22px] leading-[22px] tracking-[2.2px]">
								CONTACT US
							</p>
						</div>

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
								Reach Out Today!
							</motion.p>
						</div>
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
								className="font-nunito font-bold text-[#122F2A] text-[32px] md:text-[24px] leading-[50px] mt-[16px]">
								Join Us in Building a Thriving Community
							</motion.p>
						</div>
						<div className="flex ">
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
								className="font-rubik font-normal text-[#636363]  text-[16px] leading-[28px]  mt-[16px]">
								Have questions or want to get involved? Contact us today to
								learn more about our initiatives and how you can contribute to
								our community's success.
							</motion.p>
						</div>

						<div className="flex flex-col mt-8">
							<form
								className="flex flex-col"
								ref={formRef}
								onSubmit={handleSubmit}>
								<input type="hidden" name="formType" value="Form2" />
								<div className="grid md:grid-cols-2 gap-2">
									<input
										type="text"
										name="Name"
										className="px-2 py-3 outline-none text-[14px] text-navy font-rubik border border-[#DDDDDD] rounded-md  w-full"
										placeholder="Your Name"
										required
									/>
									<input
										type="email"
										name="Email"
										className="px-2 py-3 outline-none text-[14px] text-navy font-rubik border border-[#DDDDDD] rounded-md w-full"
										placeholder="Enter Email"
										required
									/>
								</div>
								<div className="grid ss:grid-cols-2 gap-3 mt-4">
									<input
										type="tel"
										name="PhoneNumber"
										className="px-2 py-3 outline-none text-[14px] text-navy font-rubik border border-[#DDDDDD] rounded-md w-full"
										placeholder="Phone"
									/>
									<input
										type="text"
										name="Subject"
										className="px-2 py-3 outline-none text-[14px] text-navy font-rubik border border-[#DDDDDD] rounded-md w-full"
										placeholder="Subject"
									/>
								</div>
								<div className="w-full mt-4">
									<textarea
										name="Message"
										maxLength="200"
										className="px-2 py-4 outline-none text-[14px] text-navy font-rubik border border-[#DDDDDD] rounded-md w-full"
										placeholder="Message"
										required
									/>
								</div>
								<div className="w-full flex fle-col mt-2">
									<button
										className="overflow mt-4 bg-[#213F96] rounded-md group relative overflow-hidden text-[12px] text-white px-8 py-3 before:absolute before:top-0 before:-left-full before:h-full before:w-full before:bg-[#ff5f35] before:transition-transform before:duration-500 hover:before:translate-x-full"
										type="submit">
										<span className="relative z-10 block transition-colors font-semibold duration-300 group-hover:text-white">
											Send Message
										</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Contact_form;
