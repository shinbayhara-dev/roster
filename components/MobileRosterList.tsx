
import React, { useState, useEffect } from 'react';
import { Employee, User, ShiftDefinition } from '../types';
import { SHIFT_DEFINITIONS } from '../constants';

import { generateDateKey, getDayName, getContrastYIQ, normalizeCode, BACKEND_CODE_MAP } from '../utils/scheduleUtils';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MobileRosterListProps {
    employees: Employee[];
    currentMonth: number;
    currentYear: number;
    daysArray: number[];
    getRecordForCell: (empId: string, dateKey: string) => any;
    onCellClick?: (empId: string, dateKey: string, day: number, employee: Employee) => void;
    canEdit: boolean;
    currentUser: User | null;
    masterShifts?: any[];
    masterUnits?: any[];
}

export const MobileRosterList: React.FC<MobileRosterListProps> = ({
    employees,
    currentMonth,
    currentYear,
    daysArray,
    getRecordForCell,
    onCellClick,
    canEdit,
    currentUser,
    masterShifts = [],
    masterUnits = []
}) => {
    // Determine initial day (today if valid, else 1)
    const today = new Date();
    const initialDay = (today.getMonth() === currentMonth && today.getFullYear() === currentYear)
        ? today.getDate()
        : 1;


    const [selectedDay, setSelectedDay] = useState(initialDay);

    // Ensure selectedDay matches current month when month changes
    useEffect(() => {
        const now = new Date();
        if (now.getMonth() === currentMonth && now.getFullYear() === currentYear) {
            setSelectedDay(now.getDate());
        } else {
            setSelectedDay(1);
        }
    }, [currentMonth, currentYear]);

    const handlePrevDay = () => {
        if (selectedDay > 1) setSelectedDay(selectedDay - 1);
    };

    const handleNextDay = () => {
        if (selectedDay < daysArray.length) setSelectedDay(selectedDay + 1);
    };


    const dateKey = generateDateKey(currentYear, currentMonth, selectedDay);
    const dayName = getDayName(currentYear, currentMonth, selectedDay);

    // Auto-scroll the date strip
    useEffect(() => {
        const btn = document.getElementById(`day-btn-${selectedDay}`);
        if (btn) {
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [selectedDay]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px] lg:hidden">
            {/* Mobile Date Header */}
            <div className="p-4 bg-indigo-600 text-white shadow-lg sticky top-0 z-20">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrevDay}
                        disabled={selectedDay <= 1}
                        className="p-2 bg-indigo-700/50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed active:bg-indigo-800 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>


                    <div className="text-center">
                        <p className="text-xs font-medium opacity-80 uppercase tracking-widest flex items-center justify-center gap-1">
                            {dayName}
                            {today.getDate() === selectedDay && today.getMonth() === currentMonth && today.getFullYear() === currentYear && (
                                <span className="bg-white text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full font-black ml-1">HARI INI</span>
                            )}
                        </p>
                        <h3 className="text-2xl font-black">{selectedDay} <span className="text-lg font-bold opacity-80">{new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'short' })}</span></h3>
                    </div>

                    <button
                        onClick={handleNextDay}
                        disabled={selectedDay >= daysArray.length}
                        className="p-2 bg-indigo-700/50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed active:bg-indigo-800 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

            </div>

            {/* Horizontal Day Selector */}
            <div className="bg-white border-b border-gray-100 p-2 overflow-x-auto whitespace-nowrap custom-scrollbar shrink-0">
                <div className="flex gap-2">
                    {daysArray.map(day => {
                        const isSelected = day === selectedDay;
                        const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
                        return (
                            <button
                                key={day}
                                id={`day-btn-${day}`}
                                onClick={() => setSelectedDay(day)}
                                className={`
                                    min-w-[44px] h-12 rounded-xl flex flex-col items-center justify-center transition-all shrink-0
                                    ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}
                                    ${isToday && !isSelected ? 'border-2 border-indigo-200 text-indigo-600' : ''}
                                `}
                            >
                                <span className="text-[8px] font-bold uppercase">{getDayName(currentYear, currentMonth, day).substring(0, 3)}</span>
                                <span className="text-sm font-black">{day}</span>
                                {isToday && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-600'} mt-0.5`} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* List of Staff for this Day */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">

                {employees.map(emp => {
                    const record = getRecordForCell(emp.employeeId, dateKey);

                    const nShiftCode = normalizeCode(record?.shiftCode || '');
                    const nTaskCode = normalizeCode(record?.taskCode || '');

                    // Lookup Shift Info
                    const dynamicShift = masterShifts.find(s => normalizeCode(s.code) === nShiftCode || normalizeCode(s.code) === BACKEND_CODE_MAP[nShiftCode]);
                    const shiftColor = dynamicShift?.color || (SHIFT_DEFINITIONS[nShiftCode]?.color === 'bg-white' ? '#ffffff' : SHIFT_DEFINITIONS[nShiftCode]?.color === 'bg-blue-100' ? '#dbeafe' : SHIFT_DEFINITIONS[nShiftCode]?.color === 'bg-indigo-600' ? '#4f46e5' : SHIFT_DEFINITIONS[nShiftCode]?.color === 'bg-red-600' ? '#dc2626' : SHIFT_DEFINITIONS[nShiftCode]?.color === 'bg-yellow-300' ? '#fde047' : '#ffffff');

                    // Lookup Task Info
                    const dynamicUnit = masterUnits.find(u => normalizeCode(u.code) === nTaskCode);
                    const taskColor = dynamicUnit?.color;

                    const def = SHIFT_DEFINITIONS[nTaskCode || nShiftCode] || { label: 'Tidak ada jadwal', code: '-', category: 'leave' };

                    // CSS for Dual Background
                    let cellStyle: React.CSSProperties = {};
                    let displayCode = nTaskCode || nShiftCode || '-';
                    let textColor = '#111827';
                    let displayLabel = dynamicUnit?.name || dynamicShift?.name || (def as any).label || '-';

                    if (taskColor && shiftColor && nTaskCode && nShiftCode) {
                        cellStyle = {
                            background: `linear-gradient(135deg, ${shiftColor} 50%, ${taskColor} 50%)`,
                        };
                        textColor = getContrastYIQ(taskColor);
                    } else if (taskColor) {
                        cellStyle = { backgroundColor: taskColor };
                        textColor = getContrastYIQ(taskColor);
                    } else if (shiftColor) {
                        cellStyle = { backgroundColor: shiftColor };
                        textColor = getContrastYIQ(shiftColor);
                    }

                    const isMe = currentUser?.nip === emp.employeeId;
                    const isClickable = canEdit || (isMe && !!record);
                    const isEmpty = !record;

                    return (
                        <div
                            key={emp.id}
                            onClick={() => isClickable && onCellClick && onCellClick(emp.employeeId, dateKey, selectedDay, emp)}
                            className={`
                                relative p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group
                                ${isEmpty ? 'bg-white border-gray-100' : 'bg-white border-gray-200 shadow-sm'}
                                ${isClickable ? 'active:scale-[0.98] cursor-pointer' : 'opacity-90'}
                            `}
                        >
                            {/* Left: Avatar & Name */}
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-sm
                                    ${isMe ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-2' : 'bg-gray-100 text-gray-500'}
                                `}>
                                    {emp.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate text-sm">{emp.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-mono">{emp.employeeId}</p>
                                </div>
                            </div>

                            {/* Right: Status Badge */}
                            <div
                                className="shrink-0 px-3 py-1.5 rounded-lg flex flex-col items-center justify-center min-w-[70px]"
                                style={{ ...cellStyle, color: textColor }}
                            >
                                <span className="text-sm font-black">{displayCode}</span>
                                {/* Optional: Show Label if it fits */}
                                {!isEmpty && (
                                    <span className="text-[8px] font-bold opacity-80 max-w-[80px] truncate text-center leading-tight mt-0.5">
                                        {displayLabel}
                                    </span>
                                )}
                            </div>

                            {/* Chevron for affordance if clickable */}
                            {isClickable && (
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    )
                })}

                {employees.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        Tidak ada data pegawai.
                    </div>
                )}
            </div>
        </div>
    );
};
