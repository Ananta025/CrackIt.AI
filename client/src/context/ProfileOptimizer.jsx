import React, { createContext, useContext, useState } from 'react';

const ProfileOptimizerContext = createContext(undefined);

export const useProfileOptimizer = () => {
  const context = useContext(ProfileOptimizerContext);
  if (!context) {
    throw new Error('useProfileOptimizer must be used within a ProfileOptimizerProvider');
  }
  return context;
};

export const ProfileOptimizerProvider = ({ children }) => {
  const [selectedOption, setSelectedOption] = useState('');

  return (
    <ProfileOptimizerContext.Provider value={{ selectedOption, setSelectedOption }}>
      {children}
    </ProfileOptimizerContext.Provider>
  );
};