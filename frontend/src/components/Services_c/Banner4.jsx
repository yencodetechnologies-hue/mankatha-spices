import React from "react";
import { Hero_imgb1, Progress_Arrow_img } from "../../assets";

const Banner4 = () => {
    const sectionStyle = {
		backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${Hero_imgb1})`,
		backgroundSize: "cover",
		backgroundPosition: "center",
	};

	return (
		<div className="flex items-center  w-full h-[80vh]" style={sectionStyle}>
			<p className="text-white ml-3 ">Home</p>{" "}
			<p className="text-white ml-3 flex items-center gap-2 ">
				{" "}
				<img src={Progress_Arrow_img} alt="" />
				Services
			</p>
		</div>
	);
}

export default Banner4