
import { ShiftType } from '../types';

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const generateDateKey = (year: number, month: number, day: number) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const isWeekend = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

export const getDayName = (year: number, month: number, day: number) => {
  const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const date = new Date(year, month, day);
  return DAYS[date.getDay()];
};

export const getContrastYIQ = (hexcolor: string) => {
  if (!hexcolor) return '#111827';
  try {
    const hex = hexcolor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#111827' : '#FFFFFF';
  } catch (e) {
    return '#111827';
  }
};

export const normalizeCode = (s: string) => s?.trim().toUpperCase();



export const BACKEND_CODE_MAP: Record<string, string> = {
  'P': 'PAGI',
  'S': 'SIANG', // Common code for Siang/Sore
  'M': 'MALAM',
  'L': 'OFF',
  'OFF': 'OFF',
  'C': 'CUTI',
  'CUTI': 'CUTI',
  'LB': 'OFF'
};


/**
 * Calculates duration in hours between two time strings (HH:mm or HH:mm:ss)
 * Handles overnight shifts (e.g., 21:00 to 07:00)
 * SPECIAL RULE: Pagi shift on Sat/Sun is always 07:30 - 14:30 (7 hours)
 */
export const calculateShiftHours = (startTime?: string, endTime?: string, shiftCode?: string, dateStr?: string): number => {
  if (!startTime || !endTime) return 0;

  let sTime = startTime;
  let eTime = endTime;

  // Apply special weekend rule for Morning Shift
  if (dateStr && shiftCode) {
    const nCode = normalizeCode(shiftCode);
    if (nCode === 'P' || nCode === 'PAGI') {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        sTime = '07:30';
        eTime = '14:30';
      }
    }
  }

  const [startH, startM] = sTime.split(':').map(Number);
  const [endH, endM] = eTime.split(':').map(Number);

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  // If end time is before start time, it's an overnight shift
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
};
