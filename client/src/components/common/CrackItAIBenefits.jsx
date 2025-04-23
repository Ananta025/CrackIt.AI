import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function CrackItAIBenefits() {
  const beneficiaries = [
    {
      title: "Students and recent graduates",
      description: "Practice answering tailored interview questions and gain confidence for your job search.",
      image: "/images/benefit1.svg"
    },
    {
      title: "Job seekers and Candidates",
      description: "Practice answering common interview questions and improve your performance.",
      image: "/images/benefit2.svg"
    },
    {
      title: "Remote Workers and Freelancers",
      description: "Ace virtual job interviews with AI-generated tailored questions and personalized feedback.",
      image: "/images/benefit3.svg"
    }
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const fadeInUp = {
    hidden: { 
      opacity: 0, 
      y: 40
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-blue-600 uppercase mb-2">OUR USERS</p>
        <h2 className="text-4xl font-bold text-navy-800">Who can benefit from CrackIt.AI?</h2>
      </div>

      <motion.div 
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        {beneficiaries.map((item, index) => (
          <div 
            key={index} 
            className="shadow-lg rounded-lg p-6 md:p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 bg-white w-full sm:min-w-[280px]"
          >
            <div className="mb-6 transition-all duration-300 hover:scale-95 overflow-hidden w-full">
              <img 
                src={item.image} 
                alt={item.title} 
                className="h-56 md:h-64 w-auto object-contain transition-transform duration-300 mx-auto"
              />
            </div>
            <h3 className="text-xl font-bold text-navy-800 mb-4">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
