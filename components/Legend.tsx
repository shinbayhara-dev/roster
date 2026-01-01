
import React from 'react';
import { SHIFT_DEFINITIONS } from '../constants';
import { ShiftBadge } from './ShiftBadge';

export const Legend: React.FC = () => {
  const primary = Object.values(SHIFT_DEFINITIONS).filter(d => d.category === 'primary');
  const task = Object.values(SHIFT_DEFINITIONS).filter(d => d.category === 'task');
  const leave = Object.values(SHIFT_DEFINITIONS).filter(d => d.category === 'leave');

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">Panduan Simbol</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Keterangan Shift & Tugas CSSD</p>
        </div>
      </div>

      <div className="space-y-8">
        <Section title="Shift Operasional Utama" items={primary} />
        <Section title="Tugas Khusus & Penugasan Ruang" items={task} />
        <Section title="Status Absensi & Izin" items={leave} />
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; items: any[] }> = ({ title, items }) => (
  <div>
    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
      <span className="w-4 h-px bg-gray-200" />
      {title}
    </h4>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
      {items.map((def) => (
        <div key={def.code} className="flex items-center gap-3 group">
          <ShiftBadge code={def.code} className="w-7 h-7 rounded-lg group-hover:scale-110 shadow-sm" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate leading-none mb-1 group-hover:text-indigo-600 transition-colors">{def.label}</p>
            <p className="text-[9px] text-gray-400 font-mono">CODE: {def.code}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
