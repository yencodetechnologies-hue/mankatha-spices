import {
	Hero_imgb1,
	Hero_imgb2,
	HeroIcon1,
	HeroIcon2,
	HeroIcon3,
	Partner,
	About_man,
	About_man1,
	About_man2,
	About_man3,
	About_man4,
	About_man5,
	About_man6,
	Gallery_img1,
	Gallery_img2,
	Gallery_img3,
	Gallery_img4,
	Gallery_img5,
	Gallery_img6,
	man1,
	man2,
	man3,
} from "./assets/index";

export const navLinks = [
	{
		title: "Home",
		to: "/Care/",
	},
	// {
	// 	title: "Page 2",
	// 	to: "/services",
	// 	submenu: [
	// 		{
	// 			title: "page2",
	// 			to: "/services/web-design", // corrected to include the full path
	// 		},
	// 	],
	// },
	// {
	// 	title: "About Us",
	// 	to: "/services",
	// 	submenu: [
	// 		{
	// 			title: "WebDesd",
	// 			to: "/services/web-design", // corrected to include the full path
	// 		},
	// 	],
	// },
	{
		title: "About Us",
		to: "/about",
	},
	{
		title: "Contact Us",
		to: "/contact",
	},


	{
		title: "Join Us",
		to: "Careerr",
		// to: "/mankathaspecieser/volunteer",
		submenu: [
			{
				title: "Volunteer",
				// to: "/mankathaspecieser/volunteer", // corrected to include the full path
				to: "volunteer", // corrected to include the full path
			},
			{
				title: "Career",
				to: "Careerr", // corrected to include the full path
			},
		],
	},
];

export const HeroSlider = [
	{
		id: 1,
		image: Hero_imgb1,
		icon1: HeroIcon1,
		icon2: HeroIcon2,
		icon3: HeroIcon3,
		title: "Hello",
	},
	{
		id: 2,
		image: Hero_imgb2,
		icon1: HeroIcon1,
		icon2: HeroIcon2,
		icon3: HeroIcon3,
		title: "Hello",
	}
];

export const TeamData = [
	{
		id: 1,
		image: About_man,
		name: "Thevarajah Gnanaraj",
		position: "Coordinator",

	},
	{
		id: 2,
		image: About_man1,
		name: "S.Aravinthan",
		position: "LLB, Master in Dev.Eco, PGD.Dev.Stu.&Pub.Policy, Bsc.Acc&Fin.Mgt, HNDA, MAAT."
	},
	{
		id: 3,
		image: About_man2,
		name: "Thevarajah Sivakumarasamy",
		position: "International Association of Book keepers,institute of finacial Accountant(IAB,IFA-UK)"
	},
	{
		id: 4,
		image: About_man3,
		name: "Kavichelven",
		position: "Regional Manager-HutchTelecom"
	},
	{
		id: 5,
		image: About_man4,
		name: "R.Luxmy",
		position: "BBA(Hons) Special in HRM Accountan"
	},
	{
		id: 6,
		image: About_man5,
		name: "Hemaratha",
		position: "Diploma in English",
	},
	{
		id: 6,
		image: About_man6,
		name: "N.Luxmy",
		position: "Diploma in midwifery",
	},

];

export const clients = [
	{
		id: 1,
		image: Partner,
	},
	{
		id: 2,
		image: Partner,
	},
	{
		id: 3,
		image: Partner,
	},
	{
		id: 4,
		image: Partner,
	},
	{
		id: 5,
		image: Partner,
	},
];

export const TestimonialData = [
	{
		id: 1,
		image: man1,
		name: "Krishna",
		position: "Founder",
		Description: "Mangatha Pvt Ltd has transformed our community. Through their unified investment approach and strong leadership, they have empowered us to take charge of our future. They are not just building a business; they are building trust and social value.",
	},
	{
		id: 2,
		name: "Chandran",
		image: man2,
		position: "Hr",
		Description: "I am proud to be a micro-investor with Mangatha Pvt Ltd. Their commitment to professional administration and community leadership has brought us together like never before. They are setting a new standard for community development.",
	},
	{
		id: 3,
		image: man3,
		name: "Akilan",
		position: "Hr",
		Description: "Thanks to Mangatha Pvt Ltd, our community is thriving. Their self-sufficient business model and dedication to nurturing strong community leaders have created opportunities we never thought possible. They truly care about our success and well-being.",
	},
];

export const GalleryData = [
	{
		id: 1,
		image: Gallery_img1,
		tab: 1,
	},
	{
		id: 2,
		image: Gallery_img2,
		tab: 1,
	},
	{
		id: 3,
		image: Gallery_img3,
		tab: 1,
	},
	{
		id: 4,
		image: Gallery_img4,
		tab: 1,
	},
	{
		id: 5,
		image: Gallery_img5,
		tab: 1,
	},
	{
		id: 6,
		image: Gallery_img6,
		tab: 1,
	},
	{
		id: 6,
		image: Gallery_img5,
		tab: 2,
	},
	{
		id: 6,
		image: Gallery_img6,
		tab: 2,
	},

]



