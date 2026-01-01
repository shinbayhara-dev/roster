
import React, { useMemo } from 'react';
import { Employee, MonthlyRoster, ShiftType } from '../types';
import { SHIFT_DEFINITIONS } from '../constants';
import { getDayName, isWeekend } from '../utils/scheduleUtils';
import { getHolidayName } from '../utils/holidays';
import { ShiftBadge } from './ShiftBadge';
import { Calendar as CalendarIcon, PieChart, Info, UserCheck, Briefcase } from 'lucide-react';

interface IndividualViewProps {
  selectedEmployee: Employee;
  roster: MonthlyRoster;
  daysArray: number[];
}

export const IndividualView: React.FC<IndividualViewProps> = ({ selectedEmployee, roster, daysArray }) => {
  const employeeRecords = useMemo(() => {
    return roster.records.filter(r => r.employeeId === selectedEmployee.employeeId);
  }, [roster.records, selectedEmployee.employeeId]);

  const stats = useMemo(() => {
    const counts = {
      P: 0, S: 0, M: 0, L: 0,
      taskBreakdown: {} as Record<string, number>,
      totalTasks: 0,
      total: 0
    };
    employeeRecords.forEach(r => {
      if (r.shiftCode === ShiftType.PAGI) counts.P++;
      else if (r.shiftCode === ShiftType.SORE) counts.S++;
      else if (r.shiftCode === ShiftType.MALAM) counts.M++;
      else if (r.shiftCode === ShiftType.LIBUR || r.shiftCode === ShiftType.CUTI) counts.L++;

      if (r.taskCode) {
        counts.totalTasks++;
        counts.taskBreakdown[r.taskCode] = (counts.taskBreakdown[r.taskCode] || 0) + 1;
      }
      counts.total++;
    });
    return counts;
  }, [employeeRecords]);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar: Stats & Info */}
      <div className="lg:col-span-1 space-y-4 lg:space-y-6">
        <div className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 lg:mb-8">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-black text-gray-900 tracking-tight leading-none mb-1">Statistik</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bulan Berjalan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
            <div className="space-y-3">
              <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-3 h-px bg-gray-100" />
                Shift Utama
              </p>
              <StatRow label="Dinas Pagi" value={stats.P} color="bg-gray-200" />
              <StatRow label="Dinas Sore" value={stats.S} color="bg-green-400" />
              <StatRow label="Dinas Malam" value={stats.M} color="bg-yellow-400" />
              <StatRow label="Libur/Cuti" value={stats.L} color="bg-red-400" />
            </div>

            {stats.totalTasks > 0 && (
              <div className="lg:pt-6 lg:border-t border-gray-50 space-y-3">
                <p className="text-[9px] lg:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-3 h-px bg-indigo-50" />
                  Tugas Khusus
                </p>
                <div className="space-y-2 max-h-[120px] lg:max-h-none overflow-y-auto pr-1">
                  {Object.entries(stats.taskBreakdown).map(([code, count]) => {
                    const def = SHIFT_DEFINITIONS[code as ShiftType];
                    return (
                      <StatRow
                        key={code}
                        label={def?.label || code}
                        value={count}
                        color={def?.color || 'bg-indigo-400'}
                        highlight
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-600 p-6 lg:p-8 rounded-2xl lg:rounded-[2rem] shadow-xl shadow-indigo-100 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 hidden lg:block">
            <UserCheck size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 lg:mb-6">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Info size={14} />
              </div>
              <h4 className="text-[10px] lg:text-sm font-black uppercase tracking-widest">Identitas Pegawai</h4>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-4">
              <div>
                <div className="text-[8px] lg:text-[9px] uppercase opacity-60 font-black tracking-widest mb-0.5">Nama Lengkap</div>
                <div className="text-xs lg:text-base font-black tracking-tight leading-tight">{selectedEmployee.name}</div>
              </div>
              <div>
                <div className="text-[8px] lg:text-[9px] uppercase opacity-60 font-black tracking-widest mb-0.5">ID / NIP</div>
                <div className="text-xs font-mono opacity-90">{selectedEmployee.employeeId}</div>
              </div>
            </div>
            <div className="pt-4 flex">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] lg:text-[10px] font-bold">
                <Briefcase size={10} />
                Unit Sterilisasi CSSD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main: Calendar Grid */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 lg:p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm lg:text-base font-black text-gray-900 flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-xl lg:rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                <CalendarIcon size={18} />
              </div>
              Kalender Harian
            </h3>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm shrink-0">
              <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:inline">Kapasitas:</span>
              <span className="text-xs lg:text-sm font-black text-indigo-600">{daysArray.length} Hari</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-100 border-b border-gray-100">
            {['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'].map(day => (
              <div key={day} className="bg-white py-3 text-center text-[9px] font-black text-gray-400 tracking-widest uppercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-100">
            {/* Generate calendar cells with padding for correct weekday start */}
            {(() => {
              // Calculate padding for the first day of the month
              // Note: getDay() returns 0 for Sunday, 1 for Monday, etc.
              // We want Monday (1) to be col 0.
              const firstDayOfMonth = new Date(roster.year, roster.month, 1).getDay(); // Sun=0, Mon=1, ... Sat=6
              // Convert JS Day (Sun=0) to ISO Day (Mon=1, Sun=7) for easier calculation with Monday start
              // JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
              // Target: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
              const startOffset = (firstDayOfMonth === 0 ? 7 : firstDayOfMonth) - 1;

              const cells = [];
              // Add empty padding cells
              for (let i = 0; i < startOffset; i++) {
                cells.push(<div key={`pad-${i}`} className="bg-white/50 h-32 lg:h-40" />);
              }

              // Add day cells
              daysArray.forEach(day => {
                const weekend = isWeekend(roster.year, roster.month, day);
                const holidayName = getHolidayName(roster.year, roster.month, day);
                const isRed = weekend || !!holidayName;
                const dayName = getDayName(roster.year, roster.month, day); // Ensure this matches UI locale if shown
                const record = employeeRecords.find(r => parseInt(r.date.split('-')[2]) === day);

                cells.push(
                  <div
                    key={day}
                    title={holidayName || undefined}
                    className={`bg-white p-3 lg:p-5 h-32 lg:h-40 flex flex-col justify-between transition-all relative group ${isRed ? 'bg-red-50/10' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest ${isRed ? 'text-red-400' : 'text-gray-300'}`}>
                          {dayName}
                        </span>
                        {holidayName && (
                          <span className="text-[8px] font-bold text-red-500 leading-tight mt-1 max-w-[80px] break-words line-clamp-2">
                            {holidayName}
                          </span>
                        )}
                      </div>
                      <span className={`text-xl lg:text-3xl font-black leading-none ${isRed ? 'text-red-500 scale-110' : 'text-gray-900 group-hover:text-indigo-600 transition-colors'}`}>
                        {day}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1 lg:gap-2">
                      {record ? (
                        <>
                          <ShiftBadge code={record.shiftCode} className="w-8 h-8 lg:w-12 lg:h-12 text-[10px] lg:text-xs shadow-md shadow-indigo-50 rounded-lg lg:rounded-xl" />
                          {record.taskCode && (
                            <div className="text-[7px] lg:text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 lg:px-3 py-1 rounded lg:rounded-lg border border-indigo-100 whitespace-nowrap shadow-sm truncate max-w-full">
                              {SHIFT_DEFINITIONS[record.taskCode]?.label.substring(0, 15)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-8 h-8 lg:w-12 lg:h-12 border-2 border-dashed border-gray-100 rounded-lg lg:rounded-2xl opacity-50" />
                      )}
                    </div>
                  </div>
                );
              });

              // Add trailing padding if needed to complete the grid (optional but looks nicer)
              const totalCells = cells.length;
              const remaining = 7 - (totalCells % 7);
              if (remaining < 7) {
                for (let i = 0; i < remaining; i++) {
                  cells.push(<div key={`trail-${i}`} className="bg-white/30 h-32 lg:h-40" />);
                }
              }

              return cells;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: number; color: string; highlight?: boolean; }> = ({ label, value, color, highlight }) => {
  const dotColor = color.startsWith('bg-') ? color : 'bg-indigo-400';

  return (
    <div className="flex items-center justify-between group cursor-default min-w-0">
      <div className="flex items-center gap-2 overflow-hidden mr-2">
        <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full shrink-0 ${dotColor}`} />
        <span className={`text-[10px] lg:text-xs font-bold truncate ${highlight ? 'text-indigo-600 font-black' : 'text-gray-600'}`}>
          {label}
        </span>
      </div>
      <span className={`text-[11px] lg:text-sm font-black tabular-nums ${highlight ? 'text-indigo-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
};
