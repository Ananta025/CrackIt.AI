import React from 'react';

const LoadingSpinner = ({ message = "Processing...", fullScreen = true }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50"
    : "flex flex-col justify-center items-center p-6 bg-gray-800 rounded-lg";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-white text-center">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
