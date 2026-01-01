
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color }) => {
  return (
    <div className="bg-white p-3 lg:p-5 rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 lg:p-3 rounded-lg lg:rounded-xl ${color} bg-opacity-10 shrink-0`}>
          <div className={color.replace('bg-', 'text-')}>
            {React.cloneElement(icon as React.ReactElement, { size: 16 })}
          </div>
        </div>
        {trend && (
          <span className="hidden sm:inline-block text-[9px] lg:text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full truncate">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-2 lg:mt-4 overflow-hidden">
        <h3 className="text-lg lg:text-2xl font-black text-gray-900 leading-none">{value}</h3>
        <p className="text-[9px] lg:text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider truncate">{label}</p>
      </div>
    </div>
  );
};
