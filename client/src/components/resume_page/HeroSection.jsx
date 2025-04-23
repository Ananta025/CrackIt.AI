import React, { useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
// Import required modules
import { EffectCards, Autoplay } from "swiper/modules";
import GradientText from "./GradientText";

export default function HeroSection() {
  const [createHovered, setCreateHovered] = useState(false);
  const [upgradeHovered, setUpgradeHovered] = useState(false);

  // Array of resume preview images
  const resumeImages = [
    "/images/hero1.svg",
    "/images/hero2.svg",
    "/images/hero3.svg",
    "/images/benefit1.svg",
    "/images/benefit2.svg",
    "/images/benefit3.svg",
  ];

  return (
    <div className="hero-section flex flex-col lg:flex-row items-center justify-between min-h-[85vh] sm:min-h-[90vh] md:min-h-screen px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-8 md:pb-12 md:pt-0 lg:pt-0 relative overflow-hidden bg-white">
      {/* Content section with conditional order */}
      <div className="right-side w-full lg:w-1/2 xl:w-5/12 max-w-xl mb-6 lg:mb-0 text-center lg:text-left z-10 px-3 sm:px-4 md:px-0 lg:pr-6 order-1 lg:order-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-3 sm:mb-4">
          The CV that gets the job… done
        </h1>
        <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 text-gray-600">
          Create a professional CV in minutes that stands out from the crowd
        </p>
        
        {/* Updated stats section to be flex-row on all screen sizes */}
        <div className="flex flex-row justify-between items-center mb-4 sm:mb-5 md:mb-3 lg:mb-2 gap-1 sm:gap-1 md:gap-0.5 lg:gap-0 p-2 sm:p-2 md:p-0.5 lg:p-0">
          <div className="flex flex-col items-center">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={3}
              showBorder={false}
              className="text-2xl xs:text-3xl md:text-4xl font-bold mb-0 sm:mb-1 hover:scale-110 transition-transform"
            >
              <i className="fa-solid fa-arrow-up"></i> 37%
            </GradientText>
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={3}
              showBorder={false}
              className="text-xs sm:text-sm md:text-base"
            >
              More Interview Calls
            </GradientText>
          </div>
          
          {/* Vertical divider - visible on all screens */}
          <div className="block h-14 sm:h-16 md:h-20 w-px bg-gradient-to-b from-green-300 via-blue-400 to-green-300 mx-1 sm:mx-0.5 md:mx-0"></div>
          
          <div className="flex flex-col items-center">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={3}
              showBorder={false}
              className="text-2xl xs:text-3xl md:text-4xl font-bold mb-0 sm:mb-1 hover:scale-110 transition-transform"
            >
              <i className="fa-solid fa-arrow-up"></i> 43%
            </GradientText>
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={3}
              showBorder={false}
              className="text-xs sm:text-sm md:text-base text-center"
            >
              More likely to be{" "}
              <span className="hidden sm:block">seen by recruiters</span>
              <span className="sm:hidden">seen by recruiters</span>
            </GradientText>
          </div>
        </div>
        
        {/* Buttons section - only visible on large screens */}
        <div className="hidden lg:flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center lg:justify-start w-full sm:w-auto">
          <button
            className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-5 py-2 rounded-xl font-medium hover:bg-green-700 transition duration-300 shadow-md flex items-center justify-center"
            onMouseEnter={() => setCreateHovered(true)}
            onMouseLeave={() => setCreateHovered(false)}
          >
            <span className="mr-2">Create your CV</span>
            <i
              className={`fas fa-file-alt transform transition-all duration-300 ${
                createHovered ? "opacity-100 translate-x-1" : "opacity-0"
              }`}
            ></i>
          </button>
          <button
            className="w-full sm:w-auto border border-green-600 text-green-600 px-4 sm:px-5 py-2 rounded-xl font-medium hover:bg-green-50 transition duration-300 flex items-center justify-center"
            onMouseEnter={() => setUpgradeHovered(true)}
            onMouseLeave={() => setUpgradeHovered(false)}
          >
            <span className="mr-2">Upgrade a CV</span>
            <i
              className={`fas fa-arrow-right transform transition-all duration-300 ${
                upgradeHovered ? "opacity-100 translate-x-1" : "opacity-0"
              }`}
            ></i>
          </button>
        </div>
      </div>

      {/* Swiper component with autoplay added */}
      <Swiper
        effect={"cards"}
        grabCursor={true}
        cardsEffect={{
          perSlideOffset: 8,
          perSlideRotate: 2,
          rotate: true,
          slideShadows: true,
        }}
        autoplay={{
          delay: 1000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        modules={[EffectCards, Autoplay]}
        className="mySwiper rounded-2xl shadow-xl w-full sm:w-4/5 md:w-3/5 lg:w-2/5 max-w-md lg:max-w-lg z-10 lg:-ml-2 order-2 lg:order-2"
      >
        {resumeImages.map((image, index) => (
          <SwiperSlide key={index} className="bg-white rounded-2xl">
            <img
              src={image}
              alt={`Resume template ${index + 1}`}
              className="w-full h-auto rounded-2xl"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Buttons section - only visible on medium and small screens */}
      <div className="lg:hidden flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 mb-4 justify-center w-full sm:w-auto order-3">
        <button
          className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-5 py-2 rounded-xl font-medium hover:bg-green-700 transition duration-300 shadow-md flex items-center justify-center"
          onMouseEnter={() => setCreateHovered(true)}
          onMouseLeave={() => setCreateHovered(false)}
        >
          <span className="mr-2">Create your CV</span>
          <i
            className={`fas fa-file-alt transform transition-all duration-300 ${
              createHovered ? "opacity-100 translate-x-1" : "opacity-0"
            }`}
          ></i>
        </button>
        <button
          className="w-full sm:w-auto border border-green-600 text-green-600 px-4 sm:px-5 py-2 rounded-xl font-medium hover:bg-green-50 transition duration-300 flex items-center justify-center"
          onMouseEnter={() => setUpgradeHovered(true)}
          onMouseLeave={() => setUpgradeHovered(false)}
        >
          <span className="mr-2">Upgrade a CV</span>
          <i
            className={`fas fa-arrow-right transform transition-all duration-300 ${
              upgradeHovered ? "opacity-100 translate-x-1" : "opacity-0"
            }`}
          ></i>
        </button>
      </div>
    </div>
  );
}
