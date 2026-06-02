import React from "react";
import { Link } from "react-router-dom";
import { footerimg, footerupimg, arrow } from "../assets";
import { FaTelegramPlane } from "react-icons/fa";
import { FaPhoneVolume } from "react-icons/fa6";
import { FaRegClock } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { MdForwardToInbox } from "react-icons/md";

import { logo } from "../assets";

const Footer = () => {
	const sectionStyle = {
		backgroundImage: ` url(${footerimg})`,
		backgroundSize: "cover",
		backgroundPosition: "center",
	};

	return (
		<section className="w-full flex flex-col  ">
			<div className="flex flex-col  w-ful">
				{/* upper div */}
				<div className="bg-[#1EA8DF] w-full md:px-24 px-6   relative ">
					<img
						src={footerupimg}
						alt=""
						className="hidden md:flex absolute left-1/4  bottom-0 =z-10 animate-bounce-horizontal  "
					/>
					<div className="grid md:grid-cols-2  w-full my-[50px]">
						{/* left side */}
						<div className="flex flex-col justify-center">
							{/* <div className="flex flex-cols-2">
								<div></div>
								<div>
									<p className="font-caveat font-bold text-white text-[22px] leading-[22px]     tracking-[2.2px]">
										BECOME A VOLOUNTEER
									</p>
								</div>
							</div> */}
							<div>
								<p className="font-nunito font-extrabold animatecss-backInLeft animat text-white text-[34px]  md:text-[40px] leading-[50px]  md:text-left text-center">
									Let's Make Difference
								</p>
							</div>
						</div>

						{/* right side */}
						<div className="flex md:justify-end justify-center">
							<div className="flex flex-cols-2 gap-[10px] items-center md:justify-end mt-2">
								<div className="hidden md:flex justify-end">
									<img src={arrow} className="animate-bounce" alt="" />
								</div>
								<div>
									<Link to="/Care/volunteer">
										<button className="font-nunito bg-white rounded-full px-[37px] py-[8px] font-bold text-[17px] leading-[30px] tracking-[0.25px] text-[#122F2A]">
											Join us now
										</button>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* down div */}
				<div className="w-full md:px-24 px-6 mt" style={sectionStyle}>
					<div className="flex flex-col">
						{/* top div */}

						{/* Second Div */}
						<div className="grid  md:grid-cols-4 gap-3 items-start justify-between mt-2 py-5">
							{/* 1st div */}
							<div className="flex flex-col md:col-span-2	 items-start">
								<img src={logo} alt="" />
								<p className="font-rubik font-normal text-[#BCBCBC] text-[16px] leading-[29px] tracking-[0.24px] mt-2 text-wrap">
									We are committed to cultivating a self-sustaining and thriving
									community in Valvettithurai. Built upon the pillars of unity,
									effective governance, and robust leadership, our goal is to
									foster substantial social benefits and trust
									among our community.
								</p>
								<div className="flex flex-cols-2 mt-2 gap-3 items-center">
									<FaPhoneVolume className="text-[34px] text-[#FFA415]" />
									<div className="flex flex-col ">
										<p className="font-rubik font-medium text-[#FFFFFF] text-[16px] leading-[25px] tracking-[0.24px] mt-2 text-wrap">
											Hotline  
										</p>
										<a href="tel:0094771164071" className="font-rubik font-medium text-[#FFFFFF] text-[16px] leading-[25px] tracking-[0.24px] mt-2 text-wrap hover:text-[#FFA415] transition-colors cursor-pointer">
											009 4771164071
										</a>
									</div>
								</div>
							</div>
							{/* 2nd div */}
							{/* <div className="flex flex-col text-left pt-2">
								<p className="font-nunito font-extrabold text-white text-[22px] leading-[26.4px] tracking-[0.33px]">
									Service
								</p>
								<div className="decoration-none mt-2 font-nunito font-normal text-[#BCBCBC] text-[16px] leading-[41px] tracking-[0.33px]">
									<p>Give Donation</p>
									<p>Education Support</p>
									<p>Our Campaign</p>
									<p>Our Campaign</p>
									<p>Our Campaign</p>
								</div>
							</div> */}
							{/* 3rd div */}
							<div className="flex flex-col text-left pt-2">
								<p className="font-nunito font-extrabold text-white text-[22px] leading-[26.4px] tracking-[0.33px]">
									Quick Link
								</p>
								<div className="decoration-none mt-2 font-nunito font-normal text-[#BCBCBC] text-[16px] leading-[41px] tracking-[0.33px]">
									<p> <Link to="/Care/about">About Us</Link></p>

									<p><Link to="/Care/contact">Contact Us		</Link></p>
									<p><Link to="/Care/volunteer">Volunteer		</Link></p>
									<p><Link to="/Care/Careerr">Career		</Link></p>
								</div>
							</div>
							{/* 4th div */}
							<div className="flex flex-col text-left pt-2 ">
								<p className="font-nunito font-extrabold text-white text-[22px] leading-[26.4px] tracking-[0.33px]">
									Contact Info
								</p>

								<div className="flex flex-cols-2 font-nunito font-normal text-[#BCBCBC] text-[16px]  gap-2 items-center mt-2 ">
									<FaRegClock className="text-[#FFA415] text-[17px]" />
									<div className="flex-col">
										<p>Open Hours of mankathavvt: </p>
										<p>Mon- Fri: 8.00 am. - 6.00 pm.</p>
									</div>
								</div>

								<div className="flex flex-cols-2 font-nunito font-normal text-[#BCBCBC] text-[16px]  gap-2 items-center mt-2 ">
									<CiLocationOn className="text-[#FF5528] text-[17px]" />
									<div className="flex-col">
										<p>No 11,Modern Market, Valvettithurai,Jaffna,SriLanaka</p>
									</div>
								</div>
								<div className="flex flex-cols-2 font-nunito font-normal text-[#BCBCBC] text-[16px]  gap-2 items-center mt-2 ">
									<MdForwardToInbox className="text-[#8139E7] text-[17px]" />
									<div className="flex-col">
										<a href="mailto:mankathavvt@gmail.com" className="hover:text-[#8139E7] transition-colors cursor-pointer">
											mankathavvt@gmail.com
										</a>
									</div>
								</div>
							</div>
						</div>

						{/* Third Div */}
						<div className="border-t-[0.1px]  border-[] py-4 flex items-center justify-center">
							<p className="font-nunito font-normal text-[#BCBCBC] text-[16px]">
								© 2024 Mankatha All Rights Reserved.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Footer;
