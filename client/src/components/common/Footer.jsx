import React from "react";

export default function Footer() {
  return (
    <>
      <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 pt-6 pb-4">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="flex flex-col lg:flex-row justify-between">
            <div className="mb-8 lg:mb-0 lg:w-2/5 pl-2 lg:pl-4">
              <div className="flex items-center mb-5">
                <div className="w-7 h-7 mr-2 border-1 rounded-full flex items-center justify-center">
                  <i className="fa-brands fa-airbnb text-md text-white"></i>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-wide">CrackIt.AI</h2>
              </div>
              <p className="text-sm mb-6 pr-4 text-gray-400 leading-relaxed">
                Lorem ipsum od chet dllogi. Bell trabel, samtidigt, ohöbel utom
                diska. Jinesade bel när feras redorade i belogi. FÄR paratyp i
                muväning, och pesask vyfiasat. Viktiga poddradio har un mad och
                inde.
              </p>
              <div className="flex space-x-3 mb-6">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                  <i className="fab fa-facebook-f text-white"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-400 transition-colors duration-300">
                  <i className="fab fa-twitter text-white"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-700 transition-colors duration-300">
                  <i className="fab fa-linkedin-in text-white"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-pink-600 transition-colors duration-300">
                  <i className="fab fa-instagram text-white"></i>
                </a>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-12 lg:space-x-16">
              <div className="mb-8 md:mb-0">
                <h3 className="text-lg font-bold text-white mb-5">Pages</h3>
                <ul className="space-y-3 pl-1">
                  <li>
                    <a href="#" className="hover:text-white transition-colors duration-200 flex items-center">
                      <i className="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors duration-200 flex items-center">
                      <i className="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors duration-200 flex items-center">
                      <i className="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors duration-200 flex items-center">
                      <i className="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>
                      Testimonials
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors duration-200 flex items-center">
                      <i className="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              <div className="mb-8 md:mb-0">
                <h3 className="text-lg font-bold text-white mb-5">Services</h3>
                <ul className="space-y-3 pl-1">
                  <li>
                    <a href="#" className="hover:text-white transition-colors duration-200 flex items-center">
                      <i className="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>
                      Resume Builder
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors duration-200 flex items-center">
                      <i className="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>
                      Quiz Generator
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors duration-200 flex items-center">
                      <i className="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>
                      Star Answer Builder
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors duration-200 flex items-center">
                      <i className="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>
                      LinkedIn Optimizer
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors duration-200 flex items-center">
                      <i className="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>
                      AI Interview Coach
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-5">Contact</h3>
                <ul className="space-y-3 pl-1">
                  <li className="flex items-center">
                    <i className="fas fa-phone-alt text-xs mr-3 text-blue-400"></i>
                    <span>+91 90731 41001</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-envelope text-xs mr-3 text-blue-400"></i>
                    <span>crackit.ai@gmail.com</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-globe text-xs mr-3 text-blue-400"></i>
                    <span>Earth</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-3 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} CrackIt.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
