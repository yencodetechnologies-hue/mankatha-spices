import { Home_About, Hero, Progress, Services,Event, Partners, Testimonial,Testimonial2 } from "./components"
import AOS from "aos";
import "aos/dist/aos.css";
import React, { useEffect } from "react";
function App() {
  useEffect(() => {
		AOS.init({
			offset: 100,
			duration: 800,
			easing: "ease-in-sine",
			delay: 100,
		});
		AOS.refresh();
	}, []);


  return (
    <div className="  ">
       
        <Hero className=""/>
        <Progress/>
        <Home_About/>
        {/* <Services/> */}
        {/* <Event/> */}
        {/* <Partners/> */}
        {/* <Testimonial/> */}
        <Testimonial2/>
      
     </div> 

       
      
      
  )
}

export default App
