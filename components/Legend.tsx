import React, { useState } from 'react';
import { SHIFT_DEFINITIONS } from '../constants';
import { ShiftBadge } from './ShiftBadge';
import { getContrastYIQ, normalizeCode, BACKEND_CODE_MAP } from '../utils/scheduleUtils';
import { Plus, Edit2, Trash2, X, Save, Palette } from 'lucide-react';
import { Modal } from './Modal';
import { api } from '../services/api';
import { toast } from 'sonner';

interface LegendProps {
  masterShifts?: any[];
  masterUnits?: any[];
  canEdit?: boolean;
  onRefresh?: () => void;
}

const PRESET_COLORS = [
  '#ffffff', '#000000', '#f87171', '#fb923c', '#facc15', '#a3e635',
  '#4ade80', '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8',
  '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'
];

export const Legend: React.FC<LegendProps> = ({ masterShifts = [], masterUnits = [], canEdit = false, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState<'primary' | 'task' | 'leave'>('task');
  const [formData, setFormData] = useState<any>({});

  const enrichDefinitions = (category: string) => {
    const staticDefs = Object.values(SHIFT_DEFINITIONS).filter(d => d.category === category);

    const enriched = staticDefs.map(d => {
      const code = normalizeCode(d.code);
      const bCode = BACKEND_CODE_MAP[code] || code;

      const match = masterUnits.find(u => normalizeCode(u.code) === code || normalizeCode(u.code) === bCode || normalizeCode(u.name) === normalizeCode(d.label))
        || masterShifts.find(s => normalizeCode(s.code) === code || normalizeCode(s.code) === bCode || normalizeCode(s.name) === normalizeCode(d.label));

      if (match) {
        return {
          ...d,
          id: match.id,
          label: match.name || d.label,
          dynamicStyle: {
            backgroundColor: match.color,
            borderColor: match.color,
            color: getContrastYIQ(match.color)
          },
          isFromDB: true,
          dbType: masterUnits.includes(match) ? 'unit' : 'shift'
        };
      }
      return d;
    });

    if (category === 'task') {
      masterUnits.forEach(u => {
        const uCode = normalizeCode(u.code);
        const alreadyIn = enriched.some(e => normalizeCode((e as any).code) === uCode || normalizeCode((e as any).label) === normalizeCode(u.name));
        if (!alreadyIn) {
          enriched.push({
            id: u.id,
            code: u.code,
            label: u.name,
            category: 'task',
            isFromDB: true,
            dbType: 'unit',
            dynamicStyle: {
              backgroundColor: u.color,
              borderColor: u.color,
              color: getContrastYIQ(u.color)
            }
          } as any);
        }
      });
    }

    if (category === 'primary' || category === 'leave') {
      masterShifts.forEach(s => {
        const sCode = normalizeCode(s.code);
        const isLeave = sCode === 'OFF' || sCode === 'CUTI' || normalizeCode(s.name).includes('LIBUR') || normalizeCode(s.name).includes('CUTI');

        if ((category === 'leave' && isLeave) || (category === 'primary' && !isLeave)) {
          const alreadyIn = enriched.some(e => normalizeCode((e as any).code) === sCode || normalizeCode((e as any).label) === normalizeCode(s.name));
          if (!alreadyIn) {
            enriched.push({
              id: s.id,
              code: s.code,
              label: s.name,
              category: isLeave ? 'leave' : 'primary',
              isFromDB: true,
              dbType: 'shift',
              dynamicStyle: {
                backgroundColor: s.color,
                borderColor: s.color,
                color: getContrastYIQ(s.color)
              }
            } as any);
          }
        }
      });
    }

    return enriched;
  };

  const handleOpenModal = (cat: any, item: any = null) => {
    setActiveCategory(cat);
    setEditingItem(item);
    if (item) {
      setFormData({
        code: item.code,
        name: item.label,
        color: item.dynamicStyle?.backgroundColor || '#3B82F6'
      });
    } else {
      setFormData({ code: '', name: '', color: '#6366f1' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeCategory === 'task' ? '/api/units' : '/api/shifts';
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        color: formData.color,
        description: '',
        isActive: true,
        ...(activeCategory !== 'task' && { startTime: '00:00', endTime: '00:00' })
      };

      if (editingItem && editingItem.id) {
        await api.updateUnitOrShift(endpoint, editingItem.id, payload);
        toast.success("Berhasil diperbarui");
      } else {
        await api.createUnitOrShift(endpoint, payload);
        toast.success("Berhasil ditambahkan");
      }

      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan");
    }
  };

  const handleDelete = async (item: any) => {
    if (!item.id) {
      toast.error("Item ini bersifat sistem dan tidak bisa dihapus.");
      return;
    }
    if (!confirm(`Hapus ${item.label}?`)) return;

    try {
      const endpoint = item.dbType === 'unit' ? '/api/units' : '/api/shifts';
      await api.deleteUnitOrShift(endpoint, item.id);
      toast.success("Berhasil dihapus");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const primary = enrichDefinitions('primary');
  const task = enrichDefinitions('task');
  const leave = enrichDefinitions('leave');

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">Panduan Simbol</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Keterangan Shift & Tugas CSSD</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Section
          title="Shift Operasional Utama"
          items={primary}
          canEdit={canEdit}
          onAdd={() => handleOpenModal('primary')}
          onEdit={(item) => handleOpenModal('primary', item)}
          onDelete={handleDelete}
        />
        <Section
          title="Tugas Khusus & Penugasan Ruang"
          items={task}
          canEdit={canEdit}
          onAdd={() => handleOpenModal('task')}
          onEdit={(item) => handleOpenModal('task', item)}
          onDelete={handleDelete}
        />
        <Section
          title="Status Absensi & Izin"
          items={leave}
          canEdit={canEdit}
          onAdd={() => handleOpenModal('leave')}
          onEdit={(item) => handleOpenModal('leave', item)}
          onDelete={handleDelete}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-full md:w-[450px] bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-black text-gray-900">
              {editingItem ? 'Edit Simbol' : 'Tambah Simbol Baru'}
            </h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kode</label>
                <input
                  className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-mono text-center font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                  maxLength={4}
                  placeholder="???"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nama Keterangan</label>
                <input
                  className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: Packing Steril"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pilih Warna Visual</label>
              <div className="flex flex-wrap gap-2.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${formData.color === c ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg"
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

interface SectionProps {
  title: string;
  items: any[];
  canEdit: boolean;
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

const Section: React.FC<SectionProps> = ({ title, items, canEdit, onAdd, onEdit, onDelete }) => (
  <div className="group/section">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <span className="w-4 h-px bg-gray-200" />
        {title}
      </h4>
      {canEdit && (
        <button
          onClick={onAdd}
          className="opacity-0 group-hover/section:opacity-100 flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100"
        >
          <Plus size={12} /> TAMBAH
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {items.map((def) => (
        <div key={`${def.code}-${def.label}`} className="flex items-center justify-between group/item p-2 -m-2 rounded-2xl hover:bg-gray-50 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <ShiftBadge
              code={def.code}
              className="w-8 h-8 rounded-xl shadow-sm border-none"
              customStyle={def.dynamicStyle}
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate leading-none mb-1 uppercase">{def.label}</p>
              <p className="text-[9px] text-gray-400 font-mono tracking-tighter">ID: {def.code}</p>
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
              <button onClick={() => onEdit(def)} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 size={12} /></button>
              <button onClick={() => onDelete(def)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);
