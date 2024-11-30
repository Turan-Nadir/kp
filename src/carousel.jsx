'use client';
import React, { useState, useEffect } from 'react';
import { NextIcon, PreviousIcon } from './icons';
const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // List of image URLs
  const slides = [
    '/1.png', 
    '/2.jpg', 
    '/3.jpg', 
    '/4.jpg', 
    '/5.jpg', 
  ];

  // Automatically advance the slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  // Handlers for manual navigation
  const goToPrevious = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? slides.length - 1 : prevSlide - 1
    );
  };

  const goToNext = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-200">
      {/* Display the current slide */}
      <div className="flex flex-col items-center justify-center h-full text-xl font-bold text-white bg-blue-900">
        {/* Image Display */}
        <img src={slides[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="w-full h-full object-cover" />
        
        {/* Indicator dots */}
        <div className="flex justify-center space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-gray-300' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gray-900 opacity-30"
        onClick={goToPrevious}
      >
        <PreviousIcon size={24} color="white" />
      </button>
      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gray-900 opacity-30"
        onClick={goToNext}
      >
        <NextIcon  size={24} color="white" />
      </button>
    </div>
  );
};

export default Carousel;
