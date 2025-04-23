import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  
  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Welcome to the Home Page</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={() => navigateTo('/interview')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition duration-300 ease-in-out"
        >
          Go to Interview page
        </button>

        <button
          onClick={() => navigateTo('/learning')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition duration-300 ease-in-out"
        >
          Go to Learning page
        </button>
        
        <button
          onClick={() => navigateTo('/linkedin')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition duration-300 ease-in-out"
        >
          Go to LinkedIn page
        </button>
        
        <button
          onClick={() => navigateTo('/resume')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition duration-300 ease-in-out"
        >
          Go to Resume page
        </button>
      </div>
    </div>
  );
}
