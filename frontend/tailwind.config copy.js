/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		animatedSettings: {
			animatedSpeed: 1000,
			heartBeatSpeed: 500,
			hingeSpeed: 2000,
			bounceInSpeed: 750,
			bounceOutSpeed: 750,
			animationDelaySpeed: 500,
			classes: ["shakeX", "heartBeat"],
		},
		extend: {
			keyframes: {
				bounce_horizontal: {
					"0%, 100%": { transform: "translateX(0)" },
					"50%": { transform: "translateX(50px)" },
				},
				bounce_horizontal2: {
					"0%, 100%": { transform: "translateX(0)" },
					"50%": { transform: "translateX(700px)" },
				},
				moveLeftRight: {
					"0%, 100%": { transform: "translateX(0)" },
					"50%": { transform: "translateX(calc(100% - 10px))" }, // Ensures dot stays within bounds
				},
				bounce_horizontal3: {
					"0%, 100%": { transform: "translateX(0) translateY(0)" },
					"50%": { transform: "translateX(50px) translateY(-30px)" },
				},
				wiggle: {
					"0%, 100%": { transform: "rotate(-5deg)" },
					"50%": { transform: "rotate(5deg)" },
				},
				wiperAnimation: {
					"0%": { transform: "rotate(-10deg)" },
					"25%": { transform: "rotate(10deg)" },
					"50%": { transform: "rotate(-10deg)" },
					"75%": { transform: "rotate(10deg)" },
					"100%": { transform: "rotate(-10deg)" },
				  },
			},

			colors: {
				primary: "#ffffff",
				Orange: "#ff5528",
				green2: "#122F2A",
			},
			fontFamily: {
				nunito: ["Nunito Sans", "sans-serif"],
				rubik: ["Rubik", "sans-serif"],
				caveat: ["Caveat", "cursive"],
			},

			animation: {
				"bounce-slow": " bounce 10s linear infinite",
				"pulse-slow": " pulse 3s linear infinite",
				"bounce-horizontal": "bounce_horizontal 10s linear infinite",
				"bounce-horizontal2": "bounce_horizontal2 29s linear infinite",
				"bounce-horizontal3": "bounce_horizontal3 10s linear infinite",
				"wiggle": "wiggle 5s ease-in-out infinite",
				"wiperAnimation": "wiperAnimation 10s linear infinite",
			},
		},
		screens: {
			xs: "480px",
			ss: "620px",
			sm: "768px",
			md: "1060px",
			lg: "1200px",
			xl: "1700px",
		},
	},
	plugins: [
		require("tailwindcss-animatecss"),
		 
	],
};
