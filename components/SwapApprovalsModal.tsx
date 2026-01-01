
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Check, XCircle, Clock, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '../types';

interface SwapApprovalsModalProps {
    onClose: () => void;
    currentUserRole: UserRole;
}

export const SwapApprovalsModal: React.FC<SwapApprovalsModalProps> = ({ onClose, currentUserRole }) => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await api.getSwapRequests(currentUserRole === UserRole.STAFF ? undefined : 'pending');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleApprove = async (id: number) => {
        if (!confirm('Setujui pertukaran jadwal ini? Jadwal akan otomatis diperbarui.')) return;
        try {
            await api.approveSwap(id);
            toast.success("Permintaan disetujui");
            loadRequests();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Tolak permintaan ini?')) return;
        try {
            await api.rejectSwap(id);
            toast.success("Permintaan ditolak");
            loadRequests();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="w-full md:w-[700px] bg-white rounded-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <ArrowRightLeft size={18} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900">
                        {currentUserRole === UserRole.STAFF ? 'Riwayat Tukar Jadwal' : 'Persetujuan Tukar Jadwal'}
                    </h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Memuat data...</div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">Tidak ada permintaan tukar jadwal.</div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                            {/* Status Badge */}
                            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-xl
                                ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                            `}>
                                {req.status}
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 mt-2">
                                {/* Requester Side */}
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Pengaju (Requester)</p>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            {req.requester_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{req.requester_name}</p>
                                            <p className="text-xs text-brand-orange font-mono">{req.requester_date.substring(0, 10)}</p>
                                        </div>
                                    </div>
                                    <div className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                                        Shift: {req.requester_shift_name}
                                    </div>
                                </div>

                                {/* Icon */}
                                <div className="flex items-center justify-center text-gray-300">
                                    <ArrowRightLeft size={24} strokeWidth={1.5} />
                                </div>

                                {/* Target Side */}
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Target (Ditukar dengan)</p>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 font-bold text-xs">
                                            {req.target_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{req.target_name}</p>
                                            <p className="text-xs text-brand-orange font-mono">{req.target_date.substring(0, 10)}</p>
                                        </div>
                                    </div>
                                    <div className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                                        Shift: {req.target_shift_name}
                                    </div>
                                </div>
                            </div>

                            {req.reason && (
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <p className="text-xs text-gray-500 italic">"{req.reason}"</p>
                                </div>
                            )}

                            {/* Actions for Admin */}
                            {currentUserRole !== UserRole.STAFF && req.status === 'pending' && (
                                <div className="mt-4 flex gap-3 justify-end">
                                    <button
                                        onClick={() => handleReject(req.id)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                    >
                                        Tolak
                                    </button>
                                    <button
                                        onClick={() => handleApprove(req.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-md shadow-green-100 transition-colors"
                                    >
                                        Setujui
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
