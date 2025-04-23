import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResumeFAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "What should I include in my resume?",
      answer: "Your resume should include contact information, a professional summary, work experience, education, skills, and achievements. Focus on relevant experiences and quantify your achievements where possible to make your resume more impactful. Tailor your content to match the job description for better results."
    },
    {
      question: "How do I make my resume ATS-friendly?",
      answer: "To make your resume ATS (Applicant Tracking System) friendly, use standard section headings, incorporate relevant keywords from the job description, avoid complex formatting like tables or graphics, stick to standard fonts, and save your file as a .docx or .pdf. Our tool helps optimize your resume for ATS compatibility."
    },
    {
      question: "Can I upload an old resume to improve?",
      answer: "Yes! You can upload your existing resume, and our system will analyze it for potential improvements. We'll suggest enhancements to content, structure, and keywords based on industry standards and best practices to help you create a more effective resume."
    },
    {
      question: "Do you offer different resume templates?",
      answer: "We offer a variety of professional templates designed for different industries and career levels. All our templates are optimized for both visual appeal and ATS compatibility, ensuring your resume looks great while still being machine-readable."
    },
    {
      question: "Can I download the resume as PDF?",
      answer: "Yes, you can download your completed resume in PDF format, which preserves your formatting across all devices and platforms. This is the recommended format for job applications as it maintains professional appearance and is widely accepted by employers."
    },
    {
      question: "Is this tool free to use?",
      answer: "We offer both free and premium options. The basic resume building features are available at no cost, while advanced features like unlimited templates, AI-powered content suggestions, and priority support require a subscription. Check our pricing page for details on premium features."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>
      
      <div className="space-y-3">
        {faqData.map((item, index) => (
          <div 
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          >
            <button
              className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-gray-50 transition-colors"
              onClick={() => toggleAccordion(index)}
              aria-expanded={activeIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="font-medium text-gray-800">{item.question}</span>
              <motion.span 
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-blue-600 ml-2"
              >
                <ChevronDown size={20} />
              </motion.span>
            </button>
            
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  id={`faq-answer-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 text-gray-600">
                    <p>{item.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeFAQ;
