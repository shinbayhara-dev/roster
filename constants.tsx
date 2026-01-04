import { ShiftType, ShiftDefinition } from './types';
export const API_URL = import.meta.env.VITE_API_URL || '/api';


export const SHIFT_DEFINITIONS: Record<string, ShiftDefinition> = {
  // --- Shift Operasional Utama (CORE) ---
  'P': { code: 'P', label: 'Dinas Pagi', color: 'bg-white', textColor: 'text-gray-900', category: 'primary' },
  'S': { code: 'S', label: 'Dinas Sore', color: 'bg-blue-100', textColor: 'text-blue-900', category: 'primary' },
  'M': { code: 'M', label: 'Dinas Malam', color: 'bg-indigo-600', textColor: 'text-white', category: 'primary' },
  'L': { code: 'L', label: 'Libur', color: 'bg-red-600', textColor: 'text-white', category: 'leave' },
  'C': { code: 'C', label: 'Cuti', color: 'bg-yellow-300', textColor: 'text-yellow-900', category: 'leave' },
};
