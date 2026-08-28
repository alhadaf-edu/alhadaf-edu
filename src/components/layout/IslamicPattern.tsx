import React from 'react';

interface IslamicPatternProps {
  className?: string;
  variant?: 'subtle' | 'gold' | 'stars' | 'mesh';
  opacity?: number;
}

export default function IslamicPattern({ 
  className = '', 
  variant = 'subtle',
  opacity = 0.07 
}: IslamicPatternProps) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {variant === 'stars' ? (
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-stars" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M40 0 L49 28 L78 20 L58 40 L78 60 L49 52 L40 80 L31 52 L2 60 L22 40 L2 20 L31 28 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle cx="40" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <polygon points="40,20 45,35 60,40 45,45 40,60 35,45 20,40 35,35" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-stars)" />
        </svg>
      ) : variant === 'gold' ? (
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-gold-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M30 0 L60 30 L30 60 L0 30 Z"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <path
                d="M15 15 L45 15 L45 45 L15 45 Z"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="0.8"
              />
              <circle cx="30" cy="30" r="8" fill="none" stroke="#f59e0b" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-gold-pattern)" />
        </svg>
      ) : (
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-tessellation" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M50 0 L100 50 L50 100 L0 50 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M0 0 L50 50 L0 100 M100 0 L50 50 L100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
              />
              <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="1" />
              <polygon points="50,25 57,43 75,50 57,57 50,75 43,57 25,50 43,43" fill="none" stroke="currentColor" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-tessellation)" />
        </svg>
      )}
    </div>
  );
}
