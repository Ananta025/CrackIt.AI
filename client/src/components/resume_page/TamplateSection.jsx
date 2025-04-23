import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom CSS to hide scrollbar
const hideScrollbarCSS = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

export default function TamplateSection() {
  // Sample template data with reliable image sources
  const templates = [
    { id: 1, title: 'Modern', image: 'https://picsum.photos/seed/modern/280/200', color: 'bg-blue-200' },
    { id: 2, title: 'Creative', image: 'https://picsum.photos/seed/creative/280/200', color: 'bg-purple-200' },
    { id: 3, title: 'Professional', image: 'https://picsum.photos/seed/professional/280/200', color: 'bg-gray-200' },
    { id: 4, title: 'Minimal', image: 'https://picsum.photos/seed/minimal/280/200', color: 'bg-green-200' },
    { id: 5, title: 'Executive', image: 'https://picsum.photos/seed/executive/280/200', color: 'bg-amber-200' },
  ];
  
  // Image error handling state
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (templateId) => {
    setImageErrors(prev => ({
      ...prev,
      [templateId]: true
    }));
  };
  
  const carouselRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Functions to scroll carousel
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  // Auto-scroll functionality - completely revised
  useEffect(() => {
    const carousel = carouselRef.current;
    let animationId = null;
    
    // Stop all auto-scrolling to eliminate shaking
    if (!isPaused && carousel) {
      // Instead of continuous small scrolls that cause shaking,
      // we'll use a smoother approach with timed page movements
      
      const autoScroll = () => {
        // Calculate when we're near the end
        const isNearEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 50;
        
        if (isNearEnd) {
          // Jump back to start smoothly
          carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Move one card width every few seconds
          carousel.scrollBy({ left: 350, behavior: 'smooth' });
        }
        
        // Schedule next scroll after 5 seconds
        animationId = setTimeout(autoScroll, 5000);
      };
      
      // Initial delay before starting auto-scroll
      animationId = setTimeout(autoScroll, 5000);
    }
    
    return () => {
      if (animationId) {
        clearTimeout(animationId);
      }
    };
  }, [isPaused]);
  
  // Check scroll position to show/hide arrows
  const handleScroll = () => {
    const carousel = carouselRef.current;
    if (carousel) {
      setShowLeftArrow(carousel.scrollLeft > 10);
      setShowRightArrow(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 10);
    }
  };
  
  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  return (
    <div className="bg-gray-50 py-12 px-3 sm:px-4 lg:px-2">
      {/* Inject custom scrollbar hiding CSS */}
      <style>{hideScrollbarCSS}</style>
      
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-4xl">
            Pick one of many world-class templates
          </h2>
          <p className="mt-2 text-2xl text-gray-600">
            build your resume in minutes
          </p>
        </div>
        
        {/* Templates carousel */}
        <div className="relative">
          {/* Left arrow */}
          {showLeftArrow && (
            <button 
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors hidden md:block"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} className="text-gray-800" />
            </button>
          )}
          
          {/* Templates container */}
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto hide-scrollbar snap-x py-3"
            onScroll={handleScroll}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth' // Add smooth scrolling behavior
            }}
          >
            {templates.map(template => (
              <div key={template.id} className="snap-start flex-shrink-0 px-1 first:pl-2 last:pr-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-[400px] h-[450px] group bg-white rounded-lg shadow-md overflow-hidden flex flex-col relative flex-none transition-shadow duration-300 hover:shadow-lg"
                  style={{ 
                    minWidth: '400px',
                    transform: 'translate3d(0,0,0)', // Force GPU acceleration
                    backfaceVisibility: 'hidden' // Prevent flickering
                  }}
                >
                  <div className={`h-full w-full overflow-hidden ${imageErrors[template.id] ? template.color : 'bg-gray-200'}`}>
                    {!imageErrors[template.id] && (
                      <img 
                        src={template.image} 
                        alt={`${template.title} template`} 
                        className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        onError={() => handleImageError(template.id)}
                      />
                    )}
                    {imageErrors[template.id] && (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <p className="font-medium text-lg">{template.title} Template</p>
                      </div>
                    )}
                    
                    {/* Hover overlay with button - reduced opacity */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xl font-medium mb-3">{template.title}</p>
                      <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium">
                        Use Template
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
          
          {/* Right arrow */}
          {showRightArrow && (
            <button 
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors hidden md:block"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} className="text-gray-800" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
