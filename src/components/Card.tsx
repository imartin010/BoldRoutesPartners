import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div 
      className={`card p-6 ${hover ? 'hover:shadow-xl' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
