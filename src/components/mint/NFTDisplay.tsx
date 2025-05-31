
import React from 'react';

interface NFTDisplayProps {
  imageUrl: string;
  title: string;
}

export const NFTDisplay: React.FC<NFTDisplayProps> = ({ imageUrl, title }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative w-48 h-48 overflow-hidden rounded-lg">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white text-xs font-medium">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDisplay;
