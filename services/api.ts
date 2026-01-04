import { API_URL } from '../constants';
import { User, Schedule, MonthlyRoster, AttendanceRecord, ShiftType, LoginResponse } from '../types';

// Helper for authorized fetch
const authFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Handle unauthorized (redirect to login or clear token)
            localStorage.removeItem('token');
            // window.location.href = '/login'; // If we had routing
        }
        const errorData = await response.json();
        // Handle array of errors (express-validator default)
        const msg = errorData.message || (errorData.errors ? errorData.errors[0]?.msg : 'API Error');
        throw new Error(msg);
    }

    return response.json();
};

export const api = {
    // Auth
    login: async (nip: string, password: string): Promise<LoginResponse> => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nip, password }),
        });

        const text = await response.text();

        if (!response.ok) {
            let msg = 'Login failed';
            try {
                const json = JSON.parse(text);
                msg = json.message || msg;
            } catch {
                msg = text || response.statusText || 'Server Error';
            }
            throw new Error(msg);
        }

        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Invalid server response (empty or not JSON)");
        }
    },

    getCurrentUser: async (): Promise<{ data: User }> => {
        return authFetch('/auth/me');
    },

    // Users
    getEmployees: async (): Promise<{ data: User[] }> => {
        return authFetch('/users?role=staff'); // Or fetch all and filter
    },

    getAllUsers: async (): Promise<{ data: User[] }> => {
        return authFetch('/users');
    },

    // Master Data
    getUnits: async () => authFetch('/units'),
    getShifts: async () => authFetch('/shifts'),

    // Schedules
    getSchedules: async (month: number, year: number): Promise<{ data: Schedule[] }> => {
        // Calculate start and end date of the month
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        // Get last day of month
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

        return authFetch(`/schedules?startDate=${startDate}&endDate=${endDate}`);
    },

    createSchedule: async (data: any) => {
        return authFetch('/schedules', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    createBulkSchedules: async (schedules: any[]) => {
        return authFetch('/schedules/bulk', {
            method: 'POST',
            body: JSON.stringify({ schedules }),
        });
    },

    updateSchedule: async (id: number, data: Partial<Schedule>) => {
        return authFetch(`/schedules/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteSchedule: async (id: number) => {
        return authFetch(`/schedules/${id}`, {
            method: 'DELETE',
        });
    },


    // Helper to transform backend schedules to frontend roster format
    transformToRoster: (schedules: Schedule[], month: number, year: number): MonthlyRoster => {
        const records: AttendanceRecord[] = schedules.map(s => ({
            scheduleId: s.id,
            employeeId: s.user?.nip || '', // Use NIP as ID for frontend mapping
            date: typeof s.date === 'string' ? s.date.substring(0, 10) : new Date(s.date).toISOString().substring(0, 10),
            shiftCode: s.shift?.code || (s.status === 'leave' ? ShiftType.CUTI : ShiftType.LIBUR), // Fallback logic
            taskCode: s.unit?.code // Map unit to taskCode
        }));

        return { month, year, records };
    },

    // Swaps
    createSwapRequest: async (data: any) => {
        return authFetch('/swaps', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getSwapRequests: async (status?: string) => {
        return authFetch(`/swaps${status ? `?status=${status}` : ''}`);
    },

    approveSwap: async (id: number) => {
        return authFetch(`/swaps/${id}/approve`, {
            method: 'PUT',
        });
    },


    rejectSwap: async (id: number) => {
        return authFetch(`/swaps/${id}/reject`, {
            method: 'PUT',
        });
    },

    // Master Data CRUD
    createUnitOrShift: async (endpoint: string, data: any) => {
        return authFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateUnitOrShift: async (endpoint: string, id: number, data: any) => {
        return authFetch(`${endpoint}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteUnitOrShift: async (endpoint: string, id: number) => {
        return authFetch(`${endpoint}/${id}`, {
            method: 'DELETE',
        });
    }
};
