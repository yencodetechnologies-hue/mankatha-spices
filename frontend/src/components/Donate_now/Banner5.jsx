import React from "react";
import { Hero_imgb1, Progress_Arrow_img } from "../../assets";

const Banner5 = () => {
	const sectionStyle = {
		backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${Hero_imgb1})`,
		backgroundSize: "cover",
		backgroundPosition: "center",
	};

	return (
		<div
			className="flex flex-col items-center justify-center w-full h-[80vh]"
			style={sectionStyle}>
			<div className="flex items-center justify-start flex-col">
				<div className="flex w-full   ">
					<p className=" font-nunito font-extrabold text-white text-[65px] leading-[74.4px] tracking-[0.33px]">
						Donate Now
					</p>
				</div>

				<div className="flex w-full  ">
					<p className="text-white ml-3 ">Home</p>{" "}
					<p className="text-white ml-3 flex items-center gap-2 ">
						{" "}
						<img src={Progress_Arrow_img} alt="" />
						Donate Now
					</p>
				</div>
			</div>
		</div>
	);
};

export default Banner5;
