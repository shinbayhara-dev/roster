
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Clock, MapPin, X, Save, Palette } from 'lucide-react';
import { Modal } from './Modal';
import { toast } from 'sonner';

type Tab = 'units' | 'shifts';

// Simple Color Picker
const PRESET_COLORS = [
    '#ffffff', '#000000', '#f87171', '#fb923c', '#facc15', '#a3e635',
    '#4ade80', '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8',
    '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'
];

interface SettingsManagerProps {
    onSettingsChange?: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ onSettingsChange }) => {
    const [activeTab, setActiveTab] = useState<Tab>('units');
    const [units, setUnits] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});

    const loadData = async () => {
        setLoading(true);
        try {
            const [unitsRes, shiftsRes] = await Promise.all([
                api.getUnits(),
                api.getShifts()
            ]);
            setUnits(unitsRes.data);
            setShifts(shiftsRes.data);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data pengaturan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (item: any | null = null) => {
        setEditingItem(item);
        if (activeTab === 'units') {
            setFormData(item ? { ...item } : { name: '', code: '', color: '#3B82F6', description: '', isActive: true });
        } else {
            setFormData(item ? { ...item } : { name: '', code: '', startTime: '07:00', endTime: '14:00', color: '#10B981', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
            const endpoint = activeTab === 'units' ? '/api/units' : '/api/shifts';

            // Backend expects slightly different JSON body keys? 
            // Units: code, name, description, color, isActive
            // Shifts: name, code, startTime, endTime, color, description, isActive
            // Ensure keys match.

            if (editingItem) {
                await fetch(`${endpoint}/${editingItem.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(formData)
                });
                toast.success("Berhasil diperbarui");
            } else {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(formData)
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Gagal menyimpan');
                }
                toast.success("Berhasil ditambahkan");
            }
            setIsModalOpen(false);
            loadData();
            if (onSettingsChange) onSettingsChange();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus? Data historis mungkin terpengaruh.")) return;
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'units' ? `/api/units/${id}` : `/api/shifts/${id}`;
            await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success("Item dihapus");
            loadData();
            if (onSettingsChange) onSettingsChange();
        } catch (err) {
            toast.error("Gagal menghapus");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Pengaturan Sistem</h2>
                    <p className="text-sm text-gray-500">Kelola master data shift dan unit/ruangan.</p>
                </div>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                    <Plus size={16} />
                    Tambah {activeTab === 'units' ? 'Penugasan' : 'Shift'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('units')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'units' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Penugasan
                </button>
                <button
                    onClick={() => setActiveTab('shifts')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'shifts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Shift Kerja
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Kode</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Warna</th>
                                {activeTab === 'shifts' && <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Jam</th>}
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(activeTab === 'units' ? units : shifts).map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600 bg-indigo-50/50 w-24">
                                        {item.code}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        {item.name}
                                        {item.description && <p className="text-xs text-gray-400 font-normal mt-0.5">{item.description}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-xs text-gray-400 font-mono">{item.color}</span>
                                        </div>
                                    </td>
                                    {activeTab === 'shifts' && (
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                            {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="w-full md:w-[500px] bg-white rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-900">
                            {editingItem ? 'Edit' : 'Tambah'} {activeTab === 'units' ? 'Penugasan' : 'Shift'}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Kode (Singkat)</label>
                                <input
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                                    value={formData.code || ''}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
                                <input
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {activeTab === 'shifts' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Jam Mulai</label>
                                    <input
                                        type="time"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.startTime || formData.start_time || ''} // Handle mismatch key from loading vs editing
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value, start_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Jam Selesai</label>
                                    <input
                                        type="time"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.endTime || formData.end_time || ''}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value, end_time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Warna Label</label>
                            <div className="flex flex-wrap gap-2 p-3 border border-gray-100 rounded-xl bg-gray-50">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: c })}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${formData.color === c ? 'border-gray-900 shadow-md scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={formData.color || '#000000'}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Optional</label>
                            <textarea
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};
