'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showTagline = true }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-[12px]',
  };

  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      {/* High-Tech ECU Chip Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-surface to-brand-dark border border-brand-green/40 shadow-[0_0_15px_rgba(0,255,102,0.2)] group-hover:border-brand-green transition-all duration-300`}
      >
        <div className="absolute inset-0 rounded-lg bg-brand-green/5 blur-[2px]"></div>
        <svg
          className="w-3/5 h-3/5 text-brand-green relative z-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Microcontroller Chip */}
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className={`font-black tracking-wider uppercase text-white ${textSizes[size]} leading-tight font-sans`}>
          ECU FORGE <span className="text-brand-green font-light">MASTERCLASS</span>
        </div>

        {showTagline && (
          <div className={`${taglineSizes[size]} text-brand-silver/80 tracking-widest font-mono uppercase flex items-center gap-1.5`}>
            <span>Powered by</span>
            <span className="text-brand-green font-bold tracking-normal text-shadow-sm">MECH-MOTO</span>
          </div>
        )}
      </div>
    </div>
  );
};
