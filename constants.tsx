import { ShiftType, ShiftDefinition } from './types';
export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const SHIFT_DEFINITIONS: Record<string, ShiftDefinition> = {
  // --- Shift Operasional Utama ---
  'P': { code: 'P', label: 'Dinas Pagi', color: 'bg-white', textColor: 'text-gray-900', category: 'primary' },
  'S': { code: 'S', label: 'Dinas Sore', color: 'bg-blue-100', textColor: 'text-blue-900', category: 'primary' },
  'M': { code: 'M', label: 'Dinas Malam', color: 'bg-indigo-600', textColor: 'text-white', category: 'primary' },
  'PS_S': { code: 'PS/S', label: 'Dinas Pagi Sore', color: 'bg-violet-200', textColor: 'text-violet-900', category: 'primary' },
  'SM': { code: 'SM', label: 'Sore Malam', color: 'bg-indigo-800', textColor: 'text-white', category: 'primary' },
  'L': { code: 'L', label: 'Libur', color: 'bg-red-600', textColor: 'text-white', category: 'leave' },
  'C': { code: 'C', label: 'Cuti', color: 'bg-yellow-300', textColor: 'text-yellow-900', category: 'leave' },

  // --- Tugas Khusus & Penugasan Ruang ---
  // Sterilisasi & Penyimpanan
  'ST': { code: 'ST', label: 'Ruang Penyimpanan Steril', color: 'bg-emerald-300', textColor: 'text-emerald-900', category: 'task' },

  // Distribusi
  'DS': { code: 'DS', label: 'Distribusi', color: 'bg-purple-200', textColor: 'text-purple-900', category: 'task' },
  'DSS': { code: 'DSS', label: 'Distribusi Steril', color: 'bg-fuchsia-200', textColor: 'text-fuchsia-900', category: 'task' },
  'DSK': { code: 'DSK', label: 'Distribusi Kotor', color: 'bg-stone-300', textColor: 'text-stone-900', category: 'task' },

  // Pencucian & Dekontaminasi
  'PC': { code: 'PC', label: 'Pencucian', color: 'bg-cyan-200', textColor: 'text-cyan-900', category: 'task' },
  // PS collision: User listed "Proses Pencucian dan Sterilisasi BMHP" as PS too. using 'BMHP' code internaly? 
  // Or maybe user meant 'PS' is ONLY Pengemasan and the other line was explanation? 
  // Let's add BMHP explicitly just in case.
  'BMHP': { code: 'BMHP', label: 'Proses Pencucian & Sterilisasi BMHP', color: 'bg-teal-200', textColor: 'text-teal-900', category: 'task' },

  // Pengemasan (Packing)
  'PS': { code: 'PS', label: 'Pengemasan', color: 'bg-sky-200', textColor: 'text-sky-900', category: 'task' },
  'PSS': { code: 'PSS', label: 'Pengemasan Single Set', color: 'bg-sky-300', textColor: 'text-sky-900', category: 'task' },
  'PSP': { code: 'PSP', label: 'Pengemasan Perawatan', color: 'bg-sky-100', textColor: 'text-sky-800', category: 'task' },
  'PL': { code: 'PL', label: 'Pelipatan', color: 'bg-pink-200', textColor: 'text-pink-900', category: 'task' },

  // Bahan & QC
  'PK': { code: 'PK', label: 'Plastik', color: 'bg-rose-200', textColor: 'text-rose-900', category: 'task' },
  'K': { code: 'K', label: 'Kasa', color: 'bg-orange-200', textColor: 'text-orange-900', category: 'task' },
  'QCSP': { code: 'QCSP', label: 'QC Pengemasan Single Use', color: 'bg-amber-200', textColor: 'text-amber-900', category: 'task' },

  // Lainnya
  'OP': { code: 'OP', label: 'Operator', color: 'bg-slate-300', textColor: 'text-slate-900', category: 'task' },
  'R': { code: 'R', label: 'Revisi Panduan & SOP', color: 'bg-gray-200', textColor: 'text-gray-800', category: 'task' },
};
