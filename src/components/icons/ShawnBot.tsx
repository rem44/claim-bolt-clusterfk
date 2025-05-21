import React from 'react';

const ShawnBot: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 50 50" 
    className={className}
  >
    {/* Tête du robot */}
    <rect x="10" y="5" width="30" height="30" rx="3" fill="#6b6b6b" />
    
    {/* Yeux */}
    <circle cx="20" cy="20" r="3" fill="#ffffff" />
    <circle cx="30" cy="20" r="3" fill="#ffffff" />
    
    {/* Antenne */}
    <line x1="25" y1="5" x2="25" y2="1" stroke="#6b6b6b" strokeWidth="2" />
    <circle cx="25" cy="1" r="1" fill="#6b6b6b" />
    
    {/* Barbe */}
    <path d="M15 30 L12 38 L17 36 L20 40 L25 36 L30 40 L33 36 L38 38 L35 30" fill="#8a5a44" />
    
    {/* Oreilles/modules latéraux */}
    <rect x="6" y="15" width="4" height="10" rx="1" fill="#525252" />
    <rect x="40" y="15" width="4" height="10" rx="1" fill="#525252" />
  </svg>
);

export default ShawnBot;