
import React, { useState, useMemo } from 'react';
import { X, Search, Check, Trash2, Clock, Briefcase, Calendar } from 'lucide-react';

import { ShiftType, ShiftDefinition, Employee } from '../types';
import { SHIFT_DEFINITIONS } from '../constants';
import { ShiftBadge } from './ShiftBadge';
import { normalizeCode, getContrastYIQ } from '../utils/scheduleUtils';


interface AssignmentPanelProps {
  employee: Employee;
  initialDate: string; // YYYY-MM-DD
  initialShift?: string;
  initialTask?: string;
  masterShifts?: any[];
  masterUnits?: any[];
  onSave: (date: string, shiftCode: string | null, taskCode: string | null) => void;
  onDelete?: () => void;
  onClose: () => void;
  isNew?: boolean;
}

export const AssignmentPanel: React.FC<AssignmentPanelProps> = ({
  employee,
  initialDate,
  initialShift,
  initialTask,
  masterShifts = [],
  masterUnits = [],
  onSave,
  onDelete,
  onClose,
  isNew = false
}) => {
  const [date, setDate] = useState(initialDate);
  const [selectedShift, setSelectedShift] = useState<string | null>(initialShift || null);
  const [selectedTask, setSelectedTask] = useState<string | null>(initialTask || null);
  const [search, setSearch] = useState('');

  // Combine static and dynamic shifts
  const primaryShifts = useMemo(() => {
    // Start with static ones (though many were removed)
    const staticItems = Object.values(SHIFT_DEFINITIONS).filter(d => d.category === 'primary' || d.category === 'leave');

    // Map dynamic masterShifts
    const dynamicItems = masterShifts.map(s => ({
      code: s.code,
      label: s.name,
      category: (s.code === 'OFF' || s.code === 'CUTI' || s.name.toUpperCase().includes('LIBUR')) ? 'leave' : 'primary'
    }));

    // Merge and remove duplicates (prefer dynamic)
    const combined = [...staticItems];
    dynamicItems.forEach(d => {
      if (!combined.some(c => c.code === d.code)) {
        combined.push(d as any);
      }
    });

    return combined;
  }, [masterShifts]);

  // Combine static and dynamic tasks
  const taskShifts = useMemo(() => {
    const staticItems = Object.values(SHIFT_DEFINITIONS).filter(d => d.category === 'task');
    const dynamicItems = masterUnits.map(u => ({
      code: u.code,
      label: u.name,
      category: 'task'
    }));

    const combined = [...staticItems];
    dynamicItems.forEach(d => {
      if (!combined.some(c => c.code === d.code)) {
        combined.push(d as any);
      }
    });

    return combined.filter(d =>
      d.label.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [masterUnits, search]);

  const isLeaveSelected = selectedShift ? SHIFT_DEFINITIONS[selectedShift]?.category === 'leave' : false;

  const handleSave = () => {
    onSave(date, selectedShift, selectedTask);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && confirm('Hapus jadwal ini?')) {
      onDelete();
      onClose();
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh] md:max-h-none w-full md:w-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-10 rounded-t-[1.5rem] lg:rounded-t-[2rem]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Clock size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Kelola Jadwal</h4>
            <p className="text-xs font-medium text-gray-500">{employee.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
              title="Hapus Jadwal"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* Section: Date Selection */}
        <section>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
            <Calendar size={12} /> Tanggal Dinas
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </section>


        {/* Section 1: Primary Shifts */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock size={12} />
              Shift / Kehadiran
            </h5>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {primaryShifts.map((s) => {
              const dyn = masterShifts.find(ms => normalizeCode(ms.code) === normalizeCode(s.code));
              const style = dyn ? { backgroundColor: dyn.color, color: getContrastYIQ(dyn.color), borderColor: dyn.color } : undefined;

              return (
                <button
                  key={s.code}
                  onClick={() => {
                    const newShift = s.code === selectedShift ? null : s.code;
                    setSelectedShift(newShift);
                    // Auto-clear task if shift is leave/off
                    if (s.category === 'leave') {
                      setSelectedTask(null);
                    }
                  }}
                  className={`
                    relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center
                    ${selectedShift === s.code
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-600'
                      : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50'
                    }
                  `}
                >
                  {selectedShift === s.code && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white animate-in zoom-in duration-200">
                      <Check size={10} strokeWidth={4} />
                    </div>
                  )}
                  <ShiftBadge code={s.code as any} customStyle={style} className="w-8 h-8 rounded-lg pointer-events-none" />
                  <span className={`text-[10px] font-bold leading-tight ${selectedShift === s.code ? 'text-indigo-700' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: Specific Tasks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Briefcase size={12} />
              Penugasan
            </h5>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder={isLeaveSelected ? "Tidak ada penugasan untuk status Libur/Cuti" : "Cari penugasan..."}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLeaveSelected}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
            {taskShifts.map((s) => {
              const dyn = masterUnits.find(mu => normalizeCode(mu.code) === normalizeCode(s.code));
              const style = dyn ? { backgroundColor: dyn.color, color: getContrastYIQ(dyn.color), borderColor: dyn.color } : undefined;

              return (
                <button
                  key={s.code}
                  onClick={() => setSelectedTask(s.code === selectedTask ? null : s.code)}
                  disabled={isLeaveSelected}
                  className={`
                      flex items-center justify-between p-3 rounded-xl border transition-all
                      ${selectedTask === s.code
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-gray-50 bg-white hover:border-indigo-100 hover:bg-slate-50'
                    }
                      ${isLeaveSelected ? 'opacity-40 cursor-not-allowed grayscale' : ''}
                    `}
                >
                  <div className="flex items-center gap-3">
                    <ShiftBadge code={s.code as any} customStyle={style} className="w-8 h-8 rounded-lg pointer-events-none shadow-sm" />
                    <div className="text-left">
                      <p className={`text-xs font-bold leading-none mb-1 ${selectedTask === s.code ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {s.label}
                      </p>
                      <p className="text-[9px] text-gray-400 font-mono">CODE: {s.code}</p>
                    </div>
                  </div>
                  {selectedTask === s.code ? (
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border border-gray-100 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer / Actions */}
      <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between rounded-b-[1.5rem] lg:rounded-b-[2rem]">
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-gray-500 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all"
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
        >
          <Check size={16} />
          Simpan Jadwal
        </button>
      </div>
    </div>
  );
};
