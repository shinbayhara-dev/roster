import React, { useMemo } from 'react';
import { Employee, MonthlyRoster, UserRole, User } from '../types';
import { SHIFT_DEFINITIONS } from '../constants';
import { generateDateKey, isWeekend, getDayName } from '../utils/scheduleUtils';
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
    currentUser
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

                                return (
                                    <th
                                        key={day}
                                        className={`w-8 border border-gray-300 text-[10px] font-bold text-center p-0.5 ${isRed ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}
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
                                    const def = SHIFT_DEFINITIONS[code] || SHIFT_DEFINITIONS[record?.shiftCode || ''] || { color: 'bg-white', textColor: 'text-gray-900', code: code };
                                    const bgColor = def.color;
                                    const textColor = def.textColor;

                                    const isMe = currentUser?.nip === emp.employeeId;
                                    // User can click if Admin/Sup (canEdit) OR if it is their own cell AND it has a record (to swap)
                                    // Allowing clicking empty cells for Staff doesn't make sense unless they can "Self-Schedule" (which logic doesn't support yet).
                                    // Let's assume they can only click if record exists (to request swap).
                                    const isClickable = canEdit || (isMe && !!record);

                                    return (
                                        <td
                                            key={day}
                                            className={`border border-gray-300 p-0 relative h-8 ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}`}
                                            onClick={() => isClickable && onCellClick && onCellClick(emp.employeeId, dateKey, day, emp)}
                                        >
                                            {record && (
                                                <div className={`w-full h-full flex items-center justify-center font-bold text-[10px] ${bgColor} ${textColor}`}>
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
