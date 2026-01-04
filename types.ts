// Enum for Shift Types (Keeping this for frontend logic mapping)
export enum ShiftType {
  PAGI = 'PAGI',
  SORE = 'SIANG', // Mapping to backend 'SIANG'
  MALAM = 'MALAM',
  LIBUR = 'L',
  CUTI = 'CUTI',
  // Tasks mapping (Frontend specific, backend stores as notes or separate task field if implemented later)
  STERIL = 'STERIL',
  QC = 'QC',
  DISTRIBUSI = 'DISTRIBUSI',

  // Legacy codes for compatibility if needed, map them to backend values in service layer
  PAGI_LEGACY = 'P',
  SORE_LEGACY = 'S',
  MALAM_LEGACY = 'M',
}

export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  STAFF = 'staff'
}

export interface ShiftDefinition {
  code: string;
  label: string;
  color: string;
  textColor: string;
  category: 'primary' | 'task' | 'leave';
}


export interface Employee {
  id: number; // Backend uses integer ID
  nip: string; // Backend uses nip instead of employeeId
  name: string;
  role: UserRole;
  position?: string;
}

export interface User extends Employee {
  role: UserRole;
  email: string;
  photo_url?: string;
  is_active: boolean;
}

export interface Schedule {
  id: number;
  user_id: number;
  unit_id: number;
  shift_id?: number;
  date: string; // YYYY-MM-DD
  status: 'scheduled' | 'completed' | 'cancelled' | 'absent' | 'leave';
  notes?: string;
  user?: User;
  unit?: { id: number; name: string; color: string; code: string };
  shift?: { id: number; name: string; start_time: string; end_time: string; color: string; code: string };
}

// Frontend specific interface for calendar rendering (mapping from Schedule)
export interface AttendanceRecord {
  employeeId: string; // Maps to User.nip or User.id.toString()
  date: string;
  shiftCode: string; // Maps to shift.code
  taskCode?: string; // Maps to unit.code or notes
  scheduleId?: number; // Reference to backend ID
}

export interface MonthlyRoster {
  month: number;
  year: number;
  records: AttendanceRecord[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}
