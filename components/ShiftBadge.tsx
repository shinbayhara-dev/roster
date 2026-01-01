
import React from 'react';
import { ShiftType } from '../types';
import { SHIFT_DEFINITIONS } from '../constants';

interface ShiftBadgeProps {
  code: ShiftType;
  onClick?: () => void;
  className?: string;
}

export const ShiftBadge: React.FC<ShiftBadgeProps> = ({ code, onClick, className = '' }) => {
  const definition = SHIFT_DEFINITIONS[code] || (code === 'OFF' ? SHIFT_DEFINITIONS['L'] : null);

  if (!definition) {
    // Fallback for unknown codes
    return (
      <div
        onClick={onClick}
        className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded border border-gray-200 bg-gray-100 text-gray-500 ${className}`}
        title={code}
      >
        {code}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded border border-gray-100 
        transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95
        ${definition.color} ${definition.textColor} ${className}
      `}
      title={definition.label}
    >
      {code}
    </div>
  );
};
