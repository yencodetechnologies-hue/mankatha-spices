import React, { useState } from "react";
import {
	Gallery_img1,
	Gallery_img2,
	Gallery_img3,
	Gallery_img4,
	Gallery_img5,
	Gallery_img6,
	A_1_icon,
	A_2_icon,
} from "../../assets";
import { GalleryData } from "../../Data";
const Gallery = () => {
	const [activeTab, setActiveTab] = useState(1); // Default to Tab 1

	// Filtered services based on activeTab
	const filteredServices = GalleryData.filter(
		(gallery) => gallery.tab === activeTab
	);
	return (
		<div className="flex flex-col md:px-24 px-6 pb-24 items-center justify-center">
			<div className="flex items-center gap-2 mb-8">
				<div className="flex items-center ">
					<img src={A_1_icon} alt="" />
					<img src={A_2_icon} alt="" className="animate-bounce" />
				</div>
				<p className="font-caveat font-bold text-[#1EA8DF] text-[48px] leading-[22px] tracking-[2.2px]">
					Gallery
				</p>
			</div>
			<div className="flex w-full items-center justify-center gap-8 mt-8">
				<div
					className={`tabs ${
						activeTab === 1 ? "active-tabs" : ""
					}  bg-[#213F96] text-white px-4 py-2 w-[170px] flex items-center justify-center`}
					onClick={() => setActiveTab(1)}>
					Images
				</div>
				<div
					className={`tabs ${
						activeTab === 2 ? "active-tabs" : ""
					}  bg-[#213F96] text-white px-4 py-2 w-[170px] flex items-center justify-center`}
					onClick={() => setActiveTab(2)}>
					Recent Events
				</div>
			</div>
			<div className="w-full flex mt-8 items-center justify-center gap-8 gap-y-16">
				<div
					className={`content_${activeTab} grid md:grid-cols-3 sm:grid-cols-2 gap-4  `}>
					{filteredServices.map((item, index) => (
						<div className="flex w-full ">
							<img
								src={item.image}
								alt=""
								className="h-[400px]  w-full  object-cover"
							/>
						</div>
					))}
				</div>
				{/* <div className="flex ">
						<img
							src={Gallery_img1}
							alt=""
							className="h-[400px]  w-full  object-cover"
						/>
					</div>
					<div className="flex ">
						<img
							src={Gallery_img2}
							alt=""
							className="h-[400px]  w-full  object-cover"
						/>
					</div>
					<div className="flex ">
						<img
							src={Gallery_img3}
							alt=""
							className="h-[400px]  w-full  object-cover"
						/>
					</div>
					<div className="flex ">
						<img
							src={Gallery_img4}
							alt=""
							className="h-[400px]  w-full  object-cover"
						/>
					</div>
					<div className="flex ">
						<img
							src={Gallery_img5}
							alt=""
							className="h-[400px]  w-full  object-cover"
						/>
					</div>
					<div className="flex ">
						<img
							src={Gallery_img6}
							alt=""
							className="h-[400px]  w-full  object-cover"
						/>
					</div> */}
			</div>
		</div>
	);
};

export default Gallery;
