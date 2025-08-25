import React from 'react';

interface ProjectCardProps {
  title: string;
  developer: string;
  commission: number;
  image: string;
  className?: string;
}

export default function ProjectCard({ 
  title, 
  developer, 
  commission, 
  image, 
  className = '' 
}: ProjectCardProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      {/* Background Image */}
      <div 
        className="w-full h-32 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Commission Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
            {commission}% Commission
          </span>
        </div>
        
        {/* Project Info */}
        <div className="absolute bottom-3 left-3 right-3">
          <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
          <p className="text-white text-xs opacity-90">{developer}</p>
        </div>
      </div>
    </div>
  );
}
