import React, { createContext, useContext, useState } from 'react';

const CoursePriceContext = createContext();

export const CoursePriceProvider = ({ children, courseId }) => {
  const [selectedPrice, setSelectedPrice] = useState({ value: null, description: '' });

  const updateSelectedPrice = (newPrice, description) => {
    setSelectedPrice({ value: newPrice, description });
  };

  return (
    <CoursePriceContext.Provider value={{ selectedPrice, updateSelectedPrice }}>
      {children}
    </CoursePriceContext.Provider>
  );
};

export const useCoursePrice = () => {
  return useContext(CoursePriceContext);
};

