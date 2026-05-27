import React from "react";

import {
	A_1_icon,
	A_2_icon,
	Eventimg,
	Event_img1,
	Event_img2,
	Event_img3,
	Event_img4,
	Event_img5,
	Event_img6,
} from "../../assets";
const Event = () => {
	const sectionStyle = {
		backgroundImage: `url(${Eventimg})`,
		backgroundSize: "cover",
		backgroundPosition: "center",
	};

	return (
		<div
			className="w-full flex flex-col items-center justify-center py-24"
			style={sectionStyle}>
			<div className="flex w-full flex-col ">
				<div className="flex flex-col w-full items-center justify-center">
					<div className="w-full flex items-center justify-center gap-2">
						<div className="flex  ">
							<img src={A_1_icon} alt="" />
							<img src={A_2_icon} alt=""  className="animate-bounce"/>
						</div>
						<p className="font-caveat text-center font-bold text-Orange text-[22px] leading-[22px] tracking-[2.2px]">
							OUR EVENT
						</p>
					</div>

					<p className="font-nunito font-extrabold text-white text-[40px] leading-[50px]">
						Our Upcoming Event
					</p>
				</div>

				<div className="grid md:grid-cols-3 md:px-12 px-3 gap-4 grid-flex-col-dense mt-5">
					<div className="">
						<img
							src={Event_img1}
							alt=""
							className=" object-cover h-[400px] w-full rounded-xl"
						/>
					</div>
					<div className="">
						<img
							src={Event_img2}
							alt=""
							className=" object-cover h-[315px] w-full rounded-xl"
						/>
					</div>
					<div className="">
						<img
							src={Event_img3}
							alt=""
							className=" object-cover h-full w-full rounded-xl"
						/>
					</div>
					<div className="">
						<img
							src={Event_img4}
							alt=""
							className=" object-cover h-[478px] w-full rounded-xl"
						/>
					</div>
					<div className="">
						<img
							src={Event_img5}
							alt=""
							className=" object-cover h-full w-full rounded-xl"
						/>
					</div>
					<div className="">
						<img
							src={Event_img6}
							alt=""
							className=" object-cover h-full w-full rounded-xl"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Event;
