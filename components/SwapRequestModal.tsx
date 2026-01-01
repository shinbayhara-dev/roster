
import React, { useState, useEffect } from 'react';
import { Employee, User, AttendanceRecord } from '../types';
import { api } from '../services/api';
import { X, Search, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SwapRequestModalProps {
    sourceRecord: AttendanceRecord;
    currentUser: User;
    employees: Employee[];
    roster: any; // Using any for monthly roster access
    onClose: () => void;
}

export const SwapRequestModal: React.FC<SwapRequestModalProps> = ({
    sourceRecord, currentUser, employees, roster, onClose
}) => {
    const [targetEmployeeId, setTargetEmployeeId] = useState<number | null>(null);
    const [targetDate, setTargetDate] = useState<string>('');
    const [reason, setReason] = useState('');
    const [targetSchedule, setTargetSchedule] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Filter employees to exclude self
    const validTargets = employees.filter(e => e.nip !== currentUser.nip);

    // Filtered by search
    const filteredTargets = validTargets.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId.includes(search)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetEmployeeId || !targetDate || !sourceRecord.scheduleId) {
            toast.error("Mohon lengkapi formulir");
            return;
        }

        // We need target schedule ID.
        // We have target User ID and Date.
        // We can find it from the roster passed in props OR we assume backend validates.
        // But the API requires `targetScheduleId`.
        // We must find the schedule ID for TargetUser @ TargetDate from the roster.

        const targetRecord = roster.records.find((r: AttendanceRecord) =>
        // We need to match employeeId (nip) with validTargets
        // validTargets has `id` and `employeeId` (nip).
        // roster record has `employeeId` (nip).

        // Wait, validTargets items have `.id` (backend integer ID) and `.employeeId` (nip).
        // We selected `targetEmployeeId` (integer ID).
        // We need to find the NIP corresponding to `targetEmployeeId`.
        {
            const tEmp = validTargets.find(emp => emp.id === targetEmployeeId);
            return tEmp && r.employeeId === tEmp.employeeId && r.date === targetDate;
        }
        );

        if (!targetRecord || !targetRecord.scheduleId) {
            toast.error("Jadwal target tidak ditemukan atau kosong. Tidak bisa menukar dengan jadwal kosong.");
            return;
        }

        setLoading(true);
        try {
            await api.createSwapRequest({
                targetUserId: targetEmployeeId,
                myScheduleId: sourceRecord.scheduleId,
                targetScheduleId: targetRecord.scheduleId,
                reason
            });
            toast.success("Permintaan tukar jadwal berhasil dikirim");
            onClose();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full md:w-[500px] bg-white rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900">Ajukan Tukar Jawal</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                {/* Info Source */}
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-800 uppercase mb-1">Jadwal Saya</p>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">{sourceRecord.date}</span>
                        <span className="bg-white px-2 py-1 rounded border border-indigo-200 text-xs font-mono font-bold text-indigo-600">
                            {sourceRecord.shiftCode}
                        </span>
                    </div>
                </div>

                {/* Target User */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Tukar dengan Siapa?</label>
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Cari nama pegawai..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-xl">
                        {filteredTargets.map(emp => (
                            <button
                                key={emp.id}
                                type="button"
                                onClick={() => setTargetEmployeeId(emp.id)}
                                className={`w-full text-left p-3 hover:bg-gray-50 flex items-center justify-between transition-colors
                                    ${targetEmployeeId === emp.id ? 'bg-indigo-50 text-indigo-900' : 'text-gray-700'}
                                `}
                            >
                                <span className="font-medium text-sm">{emp.name}</span>
                                {targetEmployeeId === emp.id && <Check size={16} className="text-indigo-600" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Target Date */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Tanggal Target</label>
                    <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                        Pilih tanggal jadwal teman yang ingin anda ambil.
                        Pastikan teman anda memiliki jadwal pada tanggal tersebut.
                    </p>
                </div>

                {/* Reason */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Alasan</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                        placeholder="Contoh: Ada urusan keluarga..."
                    ></textarea>
                </div>

                <div className="pt-2 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold">
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Mengirim...' : 'Kirim Permintaan'}
                    </button>
                </div>
            </form>
        </div>
    );
};
