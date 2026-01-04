import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { Employee, MonthlyRoster, UserRole, User } from '../types';
import { getDaysInMonth } from '../utils/scheduleUtils';

import { toast } from 'sonner';

export const useRoster = (isAuthenticated: boolean, currentUser: User | null) => {
    // State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [masterUnits, setMasterUnits] = useState<any[]>([]);
    const [masterShifts, setMasterShifts] = useState<any[]>([]);
    const [roster, setRoster] = useState<MonthlyRoster>({ month: new Date().getMonth(), year: new Date().getFullYear(), records: [] });

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    // Derived
    const daysInMonth = useMemo(() => getDaysInMonth(currentMonth, currentYear), [currentMonth, currentYear]);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const canEdit = (currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPERVISOR) && !isOffline;

    const loadData = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        setError(null);
        // setIsOffline(false); // Do not reset immediately to avoid flicker, let logic decide.

        try {
            // Try fetching from API
            const [empRes, scheduleRes, unitsRes, shiftsRes] = await Promise.all([
                api.getAllUsers(),
                api.getSchedules(currentMonth, currentYear),
                api.getUnits(),
                api.getShifts()
            ]);

            setMasterUnits(unitsRes.data);
            setMasterShifts(shiftsRes.data);


            const validEmployees = empRes.data.map((u: any) => ({
                id: u.id,
                employeeId: u.nip,
                name: u.name,
                nip: u.nip,
                role: u.role,
                position: u.position
            }));
            setEmployees(validEmployees);

            const transformedRoster = api.transformToRoster(scheduleRes.data, currentMonth, currentYear);
            setRoster(transformedRoster);

            // Save to LocalStorage for Offline use
            localStorage.setItem('cssd_cache_units', JSON.stringify(unitsRes.data));
            localStorage.setItem('cssd_cache_shifts', JSON.stringify(shiftsRes.data));
            localStorage.setItem('cssd_cache_employees', JSON.stringify(validEmployees));
            localStorage.setItem(`cssd_cache_roster_${currentMonth}_${currentYear}`, JSON.stringify(transformedRoster));

            setIsOffline(false);

        } catch (err: any) {
            console.error("Load data failed, trying offline cache", err);

            // Try to load from cache
            try {
                const cachedUnits = localStorage.getItem('cssd_cache_units');
                const cachedShifts = localStorage.getItem('cssd_cache_shifts');
                const cachedEmployees = localStorage.getItem('cssd_cache_employees');
                const cachedRoster = localStorage.getItem(`cssd_cache_roster_${currentMonth}_${currentYear}`);

                if (cachedEmployees && cachedRoster) {
                    if (cachedUnits) setMasterUnits(JSON.parse(cachedUnits));
                    if (cachedShifts) setMasterShifts(JSON.parse(cachedShifts));
                    setEmployees(JSON.parse(cachedEmployees));
                    setRoster(JSON.parse(cachedRoster));

                    setIsOffline(true);
                    toast.warning("Koneksi terputus. Mode Offline aktif (Read-Only).");
                } else {
                    throw new Error("Data cache tidak ditemukan");
                }
            } catch (cacheErr) {
                setError(err.message || 'Gagal memuat data dan tidak ada cache offline');
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, currentMonth, currentYear]);

    // Load data on init or month change
    useEffect(() => {
        loadData();
    }, [loadData]);

    const navigateMonth = (direction: number) => {
        let nextMonth = currentMonth + direction;
        let nextYear = currentYear;
        if (nextMonth < 0) { nextMonth = 11; nextYear--; }
        else if (nextMonth > 11) { nextMonth = 0; nextYear++; }
        setCurrentMonth(nextMonth);
        setCurrentYear(nextYear);
    };

    const getRecordForCell = useCallback((empId: string, dateKey: string) => {
        return roster.records.find(r => r.employeeId === empId && r.date === dateKey);
    }, [roster.records]);

    const updateShift = async (empId: string, dateKey: string, code: string, isTask: boolean) => {
        if (!canEdit) return;
        try {
            const employee = employees.find(e => e.employeeId === empId);
            if (!employee) throw new Error("Pegawai tidak ditemukan");

            const existingRecord = getRecordForCell(empId, dateKey);

            let unitId: number | null = null;
            let shiftId = null;
            let status = 'scheduled';
            let notes = '';

            if (isTask) {
                const selectedUnit = masterUnits.find(u => u.code === code);
                if (selectedUnit) unitId = selectedUnit.id;

                if (existingRecord) {
                    const existingShift = masterShifts.find(s => s.code === existingRecord.shiftCode);
                    if (existingShift) shiftId = existingShift.id;
                }
            } else {
                // Map Frontend Codes to Backend Codes and Status
                let backendCode = code;

                // Status Mapping
                if (code === 'L' || code === 'OFF' || code === 'LB') {
                    backendCode = 'OFF';
                    status = 'scheduled'; // DB only allows: scheduled, completed, cancelled, absent, leave. 'off' is invalid.
                } else if (code === 'C' || code === 'CUTI') {
                    backendCode = 'OFF'; // Cuti is also technically NO SHIFT, or we can look for specific Cuti shift if exists.
                    status = 'leave';
                } else {
                    // Operational Shifts
                    if (code === 'P') backendCode = 'PAGI';
                    if (code === 'S') backendCode = 'SIANG';
                    if (code === 'M') backendCode = 'MALAM';
                    status = 'scheduled';
                }

                // Find Shift ID based on mapped backend code
                const selectedShift = masterShifts.find(s => s.code === backendCode) || masterShifts.find(s => s.code === code);

                if (selectedShift) {
                    shiftId = selectedShift.id;
                }

                if (existingRecord && existingRecord.taskCode) {
                    const existingUnit = masterUnits.find(u => u.code === existingRecord.taskCode);
                    if (existingUnit) unitId = existingUnit.id;
                }
            }

            const payload: any = {
                userId: employee.id,
                unitId: unitId,
                shiftId: shiftId,
                date: dateKey,
                status: status,
                notes: notes
            };

            if (existingRecord && existingRecord.scheduleId) {
                await api.updateSchedule(existingRecord.scheduleId, payload);
            } else {
                await api.createSchedule(payload);
            }

            loadData(); // Reload data
        } catch (err: any) {
            console.error("Update failed", err);
            toast.error("Gagal update jadwal: " + err.message);
        }
    };

    const saveSchedule = async (empId: string, dateKey: string, shiftCode: string | null, taskCode: string | null) => {
        if (!canEdit) return;
        try {
            const employee = employees.find(e => e.employeeId === empId);
            if (!employee) throw new Error("Pegawai tidak ditemukan");

            let unitId: number | null = null;
            let shiftId = null;
            let status = 'scheduled';

            // Resolve Task/Unit
            if (taskCode) {
                const selectedUnit = masterUnits.find(u => u.code === taskCode);
                if (selectedUnit) unitId = selectedUnit.id;
            }

            // Resolve Shift
            if (shiftCode) {
                // Map Frontend Codes
                let backendCode = shiftCode;
                if (shiftCode === 'L' || shiftCode === 'OFF' || shiftCode === 'LB') {
                    backendCode = 'OFF';
                    status = 'scheduled';
                    unitId = null; // Force clear unit for Off
                } else if (shiftCode === 'C' || shiftCode === 'CUTI') {
                    backendCode = 'OFF';
                    status = 'leave';
                    unitId = null; // Force clear unit for Leave
                } else {
                    if (shiftCode === 'P') backendCode = 'PAGI';
                    if (shiftCode === 'S') backendCode = 'SIANG';
                    if (shiftCode === 'M') backendCode = 'MALAM';
                    if (shiftCode === 'PS/S') backendCode = 'PS/S'; // Assuming DB will have this
                    if (shiftCode === 'SM') backendCode = 'SM'; // Assuming DB will have this
                }

                const selectedShift = masterShifts.find(s => s.code === backendCode) || masterShifts.find(s => s.code === shiftCode);
                if (selectedShift) shiftId = selectedShift.id;
            }

            const payload = {
                userId: employee.id,
                unitId: unitId,
                shiftId: shiftId,
                date: dateKey,
                status: status,
                notes: ''
            };

            await api.createSchedule(payload); // Create uses UPSERT now
            loadData();
        } catch (err: any) {
            console.error("Save failed", err);
            toast.error("Gagal menyimpan jadwal: " + err.message);
        }
    };

    const deleteScheduleRecord = async (empId: string, dateKey: string) => {
        if (!canEdit) return;
        try {
            const existingRecord = getRecordForCell(empId, dateKey);
            if (!existingRecord || !existingRecord.scheduleId) return;

            await api.deleteSchedule(existingRecord.scheduleId);
            toast.success("Jadwal berhasil dihapus");
            loadData();
        } catch (err: any) {
            console.error("Delete failed", err);
            toast.error("Gagal menghapus jadwal: " + err.message);
        }
    };

    const refreshData = loadData;

    return {
        employees,
        roster,
        currentMonth,
        currentYear,
        daysArray,
        daysInMonth,
        isLoading,
        isOffline,
        error,
        refreshData,
        navigateMonth,
        updateShift,
        saveSchedule,
        deleteScheduleRecord,
        getRecordForCell,
        canEdit,
        masterUnits, // Exposed for other components if needed
        masterShifts
    };
};
