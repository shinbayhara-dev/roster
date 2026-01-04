import React, { useMemo } from 'react';
import { Employee, MonthlyRoster, UserRole, User } from '../types';
import { SHIFT_DEFINITIONS } from '../constants';

import { generateDateKey, isWeekend, getDayName, getContrastYIQ, normalizeCode, BACKEND_CODE_MAP } from '../utils/scheduleUtils';
import { getHolidayName } from '../utils/holidays';

interface RosterTableProps {
    employees: Employee[];
    daysArray: number[];
    currentMonth: number;
    currentYear: number;
    getRecordForCell: (empId: string, dateKey: string) => any;
    onCellClick?: (empId: string, dateKey: string, day: number, employee: Employee) => void;
    onEmployeeClick?: (employeeId: string) => void;
    canEdit: boolean;
    currentUser: User | null;
    masterShifts: any[];
    masterUnits: any[];
}

export const RosterTable: React.FC<RosterTableProps> = ({
    employees,
    daysArray,
    currentMonth,
    currentYear,
    getRecordForCell,
    onCellClick,
    onEmployeeClick,
    canEdit,
    currentUser,
    masterShifts = [],
    masterUnits = []
}) => {
    if (employees.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100">
                Tidak ada data pegawai ditemukan.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="overflow-x-auto custom-scrollbar touch-pan-x">
                <table className="w-full border-collapse border border-gray-300 table-fixed">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-30 bg-gray-100 w-8 border border-gray-300 text-[10px] font-bold text-center">No</th>
                            <th className="sticky left-8 z-30 bg-gray-100 w-48 border border-gray-300 text-[10px] font-bold text-center px-1">Nama Pegawai</th>
                            <th className="sticky left-56 z-30 bg-gray-100 w-16 border border-gray-300 text-[10px] font-bold text-center">NIP</th>
                            {daysArray.map(day => {
                                const weekend = isWeekend(currentYear, currentMonth, day);
                                const holidayName = getHolidayName(currentYear, currentMonth, day);
                                const isRed = weekend || !!holidayName;
                                const date = new Date(currentYear, currentMonth, day);
                                const isMonday = date.getDay() === 1;

                                return (
                                    <th
                                        key={day}
                                        className={`w-8 border border-gray-300 ${isMonday ? 'border-l-indigo-600 border-l-2' : ''} text-[10px] font-bold text-center p-0.5 ${isRed ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                                        title={holidayName || undefined}
                                    >
                                        <div className="flex flex-col items-center leading-tight">
                                            <span className="text-[8px] uppercase">{getDayName(currentYear, currentMonth, day).substring(0, 3)}</span>
                                            <span>{day}</span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp, index) => (
                            <tr key={emp.id} className="h-8">
                                <td className="sticky left-0 z-10 bg-white border border-gray-300 text-[10px] text-center">{index + 1}</td>
                                <td
                                    className="sticky left-8 z-10 bg-white border border-gray-300 px-2 text-[10px] font-medium truncate cursor-pointer hover:text-indigo-600"
                                    onClick={() => onEmployeeClick && onEmployeeClick(String(emp.id))}
                                >
                                    {emp.name}
                                </td>
                                <td className="sticky left-56 z-10 bg-white border border-gray-300 text-[9px] text-center text-gray-500">{emp.employeeId}</td>
                                {daysArray.map(day => {
                                    const dateKey = generateDateKey(currentYear, currentMonth, day);
                                    const record = getRecordForCell(emp.employeeId, dateKey);
                                    const code = record?.taskCode || record?.shiftCode || '';

                                    // Default fallback
                                    let def = SHIFT_DEFINITIONS[code] || SHIFT_DEFINITIONS[record?.shiftCode || ''] || { color: 'bg-white', textColor: 'text-gray-900', code: code };

                                    // Try dynamic lookup
                                    let dynamicBgStr = '';
                                    let dynamicTextStr = '';

                                    const nCode = normalizeCode(code);
                                    const backendCode = BACKEND_CODE_MAP[nCode] || nCode;

                                    const dynamicUnit = masterUnits.find(u => normalizeCode(u.code) === nCode || normalizeCode(u.code) === backendCode);
                                    const dynamicShift = masterShifts.find(s => normalizeCode(s.code) === nCode || normalizeCode(s.code) === backendCode);

                                    if (dynamicUnit?.color) {
                                        dynamicBgStr = dynamicUnit.color;
                                        dynamicTextStr = getContrastYIQ(dynamicBgStr);
                                    } else if (dynamicShift?.color) {
                                        dynamicBgStr = dynamicShift.color;
                                        dynamicTextStr = getContrastYIQ(dynamicBgStr);
                                    }

                                    const bgColorClass = dynamicBgStr ? '' : def.color;
                                    const textColorClass = dynamicBgStr ? '' : def.textColor;

                                    const isMe = currentUser?.nip === emp.employeeId;
                                    const isClickable = canEdit || (isMe && !!record);

                                    const date = new Date(currentYear, currentMonth, day);
                                    const isMonday = date.getDay() === 1;

                                    return (
                                        <td
                                            key={day}
                                            className={`border border-gray-300 ${isMonday ? 'border-l-indigo-600 border-l-2' : ''} p-0 relative h-8 ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}`}
                                            onClick={() => {
                                                console.log('RosterTable Cell Click:', { empId: emp.employeeId, dateKey, day });
                                                isClickable && onCellClick && onCellClick(emp.employeeId, dateKey, day, emp);
                                            }}
                                        >
                                            {record && (
                                                <div
                                                    className={`w-full h-full flex items-center justify-center font-bold text-[10px] ${bgColorClass} ${textColorClass}`}
                                                    style={dynamicBgStr ? { backgroundColor: dynamicBgStr, color: dynamicTextStr } : {}}
                                                >
                                                    {def.code || code}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
