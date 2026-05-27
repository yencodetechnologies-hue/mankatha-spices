import React from "react";
import { FaBell } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { FaFolder } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { man1, Hero_imgb1 } from "../../assets";
import { Donate_bg } from "../../assets";

const Donate_form = () => {
	const sectionStyle = {
		backgroundImage: `  url(${Donate_bg})`,
		backgroundSize: "cover",
		backgroundPosition: "center",
	};

	return (
		<div className="flex flex-col md:px-12 px-6 py-14">
			<div className="grid md:grid-cols-3 gap-4   ">
				{/* div1 */}
				<div className="w-full md:col-span-2 flex flex-col">
					{/* <div className="bg-[#F1F6F7] py-4 flex items-center px-4 rounded-md gap-2 ">
						<div className="w-[42px] h-[42px] rounded-full bg-white flex items-center justify-center">
							<FaBell className="text-[#ffa415]" />
						</div>
						<div className="flex ">
							<p className="font-rubik font-normal text-black text-[16px] leading-[28px] text-justify">
								Notice:
							</p>
							<p className="font-rubik font-normal text-[#636363] text-[16px] leading-[28px] text-justify">
								Test mode is enabled. While in test mode no live donations are
								processed.
							</p>
						</div>
					</div> */}
					<div className="flex   mb-4">
						<p className="font-nunito font-extrabold text-[#122f2A] text-[20px] leading-[32px] tracking-[0.33px]">
							Support Our Mission: Donate to Mangatha Pvt Ltd
						</p>
					</div>
					<div className="flex   ">
						<p className="font-nunito font-extrabold text-[#122f2A] text-[32px] leading-[32px] tracking-[0.33px]">
							Join Our Team at Mangatha Pvt Ltd
						</p>
					</div>
					<div className="flex   ">
						<p className="flex gap-2 font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-8">
							Your donation to Mangatha Pvt Ltd plays a crucial role in
							empowering and uplifting the Valvetithurai community. We are
							committed to creating a self-sufficient environment where every
							individual can thrive. Your support enables us to fund essential
							projects, drive social value, and foster sustainable growth
							in our community.
						</p>
					</div>
					<div className="flex   ">
						<p className="flex gap-2 font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-8">
							Your donation to Mangatha Pvt Ltd plays a crucial role in
							empowering and uplifting the Valvetithurai community. We are
							committed to creating a self-sufficient environment where every
							individual can thrive. Your support enables us to fund essential
							projects, drive social value, and foster sustainable growth
							in our community.
						</p>
					</div>

					<div className="flex flex-col mt-4">
						<div className="flex">
							<p className="font-nunito text-[30px] leading-[36px] font-extrabold text-green2">
							How to Donate:

							</p>
						</div>
						<div className="flex   ">
						<p className="flex gap-2 font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] mt-8 mb-6">
						Your support is vital to our mission. To make a donation or learn more about our initiatives, please contact us using the form below. Together, we can build a brighter future for Valvetithurai.
						</p>
					</div>
						<div className="flex flex-col my-3">
							<div className="grid md:grid-cols-2 gap-3">
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
							<div className="flex  mt-4">
								<input
									type="text"
									name="Name"
									className="px-2 py-3 outline-none text-[14px] text-navy font-rubik border border-[#DDDDDD] rounded-md  w-full"
									placeholder="Address"
									required
								/>
							</div>
							<div className="w-full flex fle-col mt-2">
								<button
									className="overflow mt-4 bg-[#FFA415] rounded-md group relative overflow-hidden text-[12px] text-white px-8 py-3 before:absolute before:top-0 before:-left-full before:h-full before:w-full before:bg-[#ff5f35] before:transition-transform before:duration-500 hover:before:translate-x-full"
									type="submit">
									<span className="relative z-10 block transition-colors font-semibold duration-300 group-hover:text-white">
										Send Message
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* div2 */}
				<div className="w-full flex flex-col gap-4">
					<div className="flex flex-col">
						<div>
							<img src={Hero_imgb1} alt="" />
						</div>
						<div className="flex flex-col items-center justify-start px-2 py-4 border-x-2 ">
							<p className="font-nunito text-[24px] leading-[30px] font-extrabold text-green2">
								We Can Aenean Poor leo Nec This Rnare.
							</p>
							<p className="font-rubik font-normal text-[#636363] text-[16px] leading-[28px]  ">
								We poor standard chunk ofI nibh velit auctor aliquet sollic
								tudin.
							</p>
						</div>
						<div className="py-8  bg-[#F1F6F7] px-2" style={sectionStyle}>
							<div className="skill-bar mt-2 w-full h-2 bg-gray-300 rounded-lg">
								<span
									className="skill-per html relative block h-full bg-Orange rounded-lg"
									style={{ width: "85%" }}>
									<span className="tooltip absolute right-[-14px] top-[-40px] text-xs font-medium text-white bg-Orange py-1 px-2 rounded-md">
										85%
									</span>
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="title block text-base font-nunito text-[16px] leading-[28px] font-bold text-green2">
									$13,000 Goals
								</span>
								<span className="title block text-base font-nunito text-[16px] leading-[28px] font-bold text-green2">
									$5,000 Donate
								</span>
							</div>
						</div>
					</div>
					<div className="w-full bg-Orange rounded-md flex ">
						<div className=" w-full rounded-md bg-[#F1F6F7] mt-2  py-6">
							<div className="flex flex-col w-full">
								<div className="flex  w-full items-center justify-center gap-4 py-6 border-b-2">
									<div>
										<img src={man1} alt="" className="w-[71px] h-[71px]" />
									</div>
									<div className="flex flex-col ">
										<p className="font-nunito font-extrabold text-[#122F2A]  text-[24px] leading-[28px] text-justify">
											Phillip Haris
										</p>

										<p className="font-rubik font-normal text-[#636363]  text-[16px] leading-[28px] text-justify">
											Founder
										</p>
									</div>
								</div>
								<div className="flex flex-col mt-4 justify-center items-center gap-2">
									<div className="flex gap-2">
										<SlCalender className="text-[#ffa415]" />
										<p className="font-rubik font-normal text-[#636363]  text-[16px]    ">
											Sep 2024
										</p>{" "}
									</div>
									<div className="flex gap-2">
										<FaFolder className="text-[#ffa415]" />{" "}
										<p className="font-rubik font-normal text-[#636363]  text-[16px]    ">
											Environment
										</p>{" "}
									</div>
									<div className="flex gap-2">
										<MdLocationOn className="text-[#ffa415]" />
										<p className="font-rubik font-normal text-[#636363]  text-[16px]    ">
											London, Canada
										</p>
									</div>
								</div>
								<div></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Donate_form;
