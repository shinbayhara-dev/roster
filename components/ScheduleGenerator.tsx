import React, { useState, useEffect } from 'react';
import { Calendar, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Employee } from '../types';
import { api } from '../services/api';

interface ScheduleGeneratorProps {
    currentMonth: number;
    currentYear: number;
    employees: Employee[];
    onSuccess: () => void;
    onClose: () => void;
}

export const ScheduleGenerator: React.FC<ScheduleGeneratorProps> = ({
    currentMonth,
    currentYear,
    employees,
    onSuccess,
    onClose
}) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [selectedPattern, setSelectedPattern] = useState<'office' | 'rotation'>('office');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [u, s] = await Promise.all([api.getUnits(), api.getShifts()]);
                setUnits(u.data);
                setShifts(s.data);
            } catch (err) {
                setError('Gagal memuat data master unit/shift');
            }
        };
        fetchMasterData();
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);

        try {
            if (units.length === 0 || shifts.length === 0) {
                throw new Error("Data master belum siap");
            }

            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const schedules = [];

            // Find IDs (assuming standard names or just taking first available)
            const shiftPagi = shifts.find(s => s.code === 'PAGI') || shifts[0];
            const shiftOff = shifts.find(s => s.code === 'OFF') || null;

            // Rotate units for variety
            const workingUnits = units.filter(u => u.code !== 'OFF'); // Assuming no OFF unit, but just in case

            for (const emp of employees) {
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(currentYear, currentMonth, day);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sun=0, Sat=6
                    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                    if (selectedPattern === 'office') {
                        if (isWeekend) {
                            // Weekend OFF? Or just skip? Let's skip explicitly creating OFF schedules unless needed
                            // Use shiftOff if exists
                            /* 
                            if (shiftOff) {
                                 schedules.push({
                                    userId: emp.id,
                                    unitId: workingUnits[0].id, // Dummy unit for off?
                                    shiftId: shiftOff.id,
                                    date: dateString,
                                    status: 'scheduled'
                                });
                            }
                            */
                            // Ideally we don't spam OFF records unless required. 
                            // But if "input jadwal" means "fill the empty voids", maybe we should?
                            // Let's stick to filling 'working' days.
                            continue;
                        } else {
                            // Mon-Fri: Pagi
                            schedules.push({
                                userId: emp.id,
                                unitId: workingUnits[Math.floor(Math.random() * workingUnits.length)].id, // Random unit assignment
                                shiftId: shiftPagi.id,
                                date: dateString,
                                status: 'scheduled'
                            });
                        }
                    } else if (selectedPattern === 'rotation') {
                        // Simple pattern based on day number
                        // 1-2 Pagi, 3-4 Siang, 5-6 Malam, 7 Off
                        // Using day index roughly
                        const patternIndex = (day + parseInt(emp.id)) % 4; // Shift variety
                        let assignedShift = shifts[patternIndex % shifts.length]; // fallback

                        // Better heuristic:
                        // ID % 3 to determine starting rotation
                        // Just random for demo
                        assignedShift = shifts[Math.floor(Math.random() * shifts.length)];

                        if (assignedShift.code !== 'OFF') {
                            schedules.push({
                                userId: emp.id,
                                unitId: workingUnits[Math.floor(Math.random() * workingUnits.length)].id,
                                shiftId: assignedShift.id,
                                date: dateString,
                                status: 'scheduled'
                            });
                        }
                    }
                }
            }

            console.log(`Generating ${schedules.length} schedules...`);
            await api.createBulkSchedules(schedules);

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Gagal membuat jadwal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md w-full mx-auto bg-white">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                    <Calendar size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Generator Jadwal Otomatis</h3>
                    <p className="text-sm text-gray-500">
                        {new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div className="space-y-4 mb-8">
                <label className="block p-4 border rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                    <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="pattern"
                            value="office"
                            checked={selectedPattern === 'office'}
                            onChange={() => setSelectedPattern('office')}
                            className="w-4 h-4 text-indigo-600"
                        />
                        <div>
                            <span className="font-bold text-gray-900 group-hover:text-indigo-700 block">Office Hours (Senin - Jumat)</span>
                            <span className="text-xs text-gray-500">Semua staff masuk Shift Pagi, Libur Sabtu-Minggu. Unit diacak.</span>
                        </div>
                    </div>
                </label>

                <label className="block p-4 border rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                    <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="pattern"
                            value="rotation"
                            checked={selectedPattern === 'rotation'}
                            onChange={() => setSelectedPattern('rotation')}
                            className="w-4 h-4 text-indigo-600"
                        />
                        <div>
                            <span className="font-bold text-gray-900 group-hover:text-indigo-700 block">Rotasi Acak (Demo)</span>
                            <span className="text-xs text-gray-500">Isi jadwal secara acak dengan pola shift Pagi/Siang/Malam untuk demo.</span>
                        </div>
                    </div>
                </label>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200"
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Generate
                </button>
            </div>
        </div>
    );
};
