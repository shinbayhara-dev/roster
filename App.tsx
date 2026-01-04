import React, { useState, useMemo } from 'react';
import {
  Users, Activity, User as UserIcon, Settings,
  Menu, Search, Plus, Clock, ChevronLeft, ChevronRight, LogOut, ShieldCheck, Calendar, ArrowRightLeft
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { UserRole, Employee } from './types';
import { Legend } from './components/Legend';
import { IndividualView } from './components/IndividualView';
import { StatCard } from './components/StatCard';
import { AssignmentPanel } from './components/AssignmentPanel';
import { Modal } from './components/Modal';
import { Sidebar, NavItem } from './components/Sidebar';
import { LoginForm } from './components/LoginForm';
import { RosterTable } from './components/RosterTable';
import { EmployeeManager } from './components/EmployeeManager';
import { SettingsManager } from './components/SettingsManager';

import { useAuth } from './hooks/useAuth';
import { useRoster } from './hooks/useRoster';
import { MobileRosterList } from './components/MobileRosterList';
import { SwapRequestModal } from './components/SwapRequestModal';
import { SwapApprovalsModal } from './components/SwapApprovalsModal';


const App = () => {
  // --- Custom Hooks ---
  const {
    currentUser, isAuthenticated, isLoading: authLoading, error: authError,
    login, logout
  } = useAuth();

  const {
    employees, roster, currentMonth, currentYear,
    daysArray, navigateMonth, updateShift, saveSchedule, deleteScheduleRecord, getRecordForCell,
    isLoading: dataLoading, refreshData, canEdit, isOffline, masterUnits, masterShifts
  } = useRoster(isAuthenticated, currentUser);

  // --- UI State ---
  const [activeView, setActiveView] = useState<'global' | 'individual' | 'employees' | 'settings'>('global');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState<{ empId: string; date: string; day: number; employee: Employee; mode: 'edit' | 'swap' } | null>(null);
  const [selectedIndividualId, setSelectedIndividualId] = useState<string>('');
  const [showSwapList, setShowSwapList] = useState(false);

  // --- Derived State UI ---
  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employeeId.includes(searchQuery)
    );
  }, [employees, searchQuery]);

  const selectedEmployee = useMemo(() => {
    if (currentUser?.role === UserRole.STAFF && activeView === 'individual') {
      return employees.find(e => e.employeeId === currentUser.nip) || employees[0];
    }
    if (!selectedIndividualId && employees.length > 0) {
      return employees.find(e => String(e.id) === String(selectedIndividualId)) || employees[0];
    }
    return employees.find(e => String(e.id) === String(selectedIndividualId)) || employees[0];
  }, [employees, selectedIndividualId, currentUser, activeView]);

  const stats = useMemo(() => {
    const today = new Date();
    if (today.getMonth() !== currentMonth || today.getFullYear() !== currentYear) {
      return { onDutyToday: 0, morningShift: 0, afternoonShift: 0, nightShift: 0 };
    }
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayRecords = roster.records.filter(r => r.date === todayKey);
    return {
      onDutyToday: todayRecords.length,
      morningShift: todayRecords.filter(r => r.shiftCode === 'P').length,
      afternoonShift: todayRecords.filter(r => r.shiftCode === 'S').length,
      nightShift: todayRecords.filter(r => r.shiftCode === 'M').length,
    };
  }, [roster, currentMonth, currentYear]);

  // --- Handlers ---
  const handleAddSchedule = () => {
    if (employees.length === 0) return;
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setEditingCell({
      empId: employees[0].employeeId,
      date: dateKey,
      day: today.getDate(),
      employee: employees[0],
      mode: 'edit'
    });
  };

  /* OLD - TO BE REMOVED AFTER TESTING
  const handleUpdateShift = async (code: string, isTask: boolean) => {
    if (!editingCell) return;
    await updateShift(editingCell.empId, editingCell.date, code, isTask);
    setEditingCell(null);
  } */

  const handleUpdateShiftV2 = async (date: string, shiftCode: string | null, taskCode: string | null) => {
    if (!editingCell) return;
    // We need to call updateShift. 
    // Currently updateShift takes just one code and isTask bool.
    // The useRoster hook needs to expose a more flexible update function 
    // OR we act smart here.
    // Actually, useRoster.updateShift logic is: 
    // IF isTask: set unitId, find shift from existing.
    // IF !isTask: set shiftId, keep unitId from existing/new.
    // Since we now have BOTH shiftCode and taskCode explicitly selected from the UI,
    // we should create a new function in useRoster or call updateShift cleanly.

    // BUT `updateShift` in useRoster is designed for single-click toggles.
    // We should probably expose `api.createSchedule` wrapper in useRoster.
    // Let's modify useRoster.ts to export a `saveSchedule` function.

    // For now, let's use the internal logic:
    // We need to map codes to Ids.
    // But helper `updateShift` does that mapping nicely.
    // It is simpler to just update `useRoster` to accept `saveFullSchedule`.

    // Let's assume for this step we will add `saveSchedule` to useRoster in next step.
    // I will call `saveSchedule` here.
    await saveSchedule(editingCell.empId, date, shiftCode, taskCode);
    toast.success('Jadwal berhasil diperbarui');
    setEditingCell(null);
  }

  // --- Render ---

  if (!isAuthenticated) {
    return <LoginForm onLogin={async (email, password) => { await login(email, password); }} isLoading={authLoading} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-inter overflow-hidden h-screen">
      {(dataLoading) && (
        <div className="fixed inset-0 z-[100] bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        setSidebarOpen={setSidebarOpen}
        currentUser={currentUser}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {isOffline && (
          <div className="bg-gray-800 text-white px-4 py-3 text-xs font-bold text-center shadow-lg z-50 animate-pulse">
            ⚠️ KONEKSI TERPUTUS - MODE OFFLINE (BACA SAJA)
          </div>
        )}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50">
          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 lg:hidden">
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari pegawai..."
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-48 lg:w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center bg-gray-50 p-0.5 lg:p-1 rounded-xl border border-gray-100">
              <button onClick={() => navigateMonth(-1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all"><ChevronLeft size={16} /></button>
              <div className="px-1 lg:px-3 text-[10px] lg:text-xs font-black text-gray-700 min-w-[80px] lg:min-w-[120px] text-center truncate">
                {new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
              </div>
              <button onClick={() => navigateMonth(1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all"><ChevronRight size={16} /></button>
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-8 space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-8">
          {activeView === 'global' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">Dashboard Departemen</h2>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">Status CSSD - {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSwapList(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-xs font-bold hover:bg-orange-200 transition-colors"
                  >
                    <ArrowRightLeft size={16} />
                    {currentUser?.role === UserRole.STAFF ? 'Riwayat Tukar' : 'Persetujuan Tukar'}
                  </button>
                  <button onClick={() => refreshData()} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold">Segarkan</button>
                </div>
              </div>

              <div>
                <div className="lg:hidden grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-indigo-600 text-white p-3 rounded-2xl flex items-center justify-between shadow-indigo-200 shadow-lg">
                    <span className="text-xs font-bold opacity-80">Sedang Dinas</span>
                    <span className="text-xl font-black">{stats.onDutyToday}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm">
                    <span className="text-xs font-bold text-gray-500">Total Shift</span>
                    <span className="text-xl font-black text-gray-900">{stats.morningShift + stats.afternoonShift + stats.nightShift}</span>
                  </div>
                </div>

                <div className="hidden lg:grid grid-cols-4 gap-4">
                  <StatCard label="Sedang Dinas" value={stats.onDutyToday} icon={<Users size={16} />} color="bg-indigo-600" />
                  <StatCard label="Pagi" value={stats.morningShift} icon={<Clock size={16} />} color="bg-white text-gray-900 border border-gray-200" />
                  <StatCard label="Sore" value={stats.afternoonShift} icon={<Activity size={16} />} color="bg-blue-200 text-blue-900" />
                  <StatCard label="Malam" value={stats.nightShift} icon={<Activity size={16} />} color="bg-indigo-600" />
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                <RosterTable
                  employees={filteredEmployees}
                  daysArray={daysArray}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  getRecordForCell={getRecordForCell}
                  canEdit={!!canEdit}
                  currentUser={currentUser}
                  masterShifts={masterShifts}
                  masterUnits={masterUnits}
                  onCellClick={(empId, dateKey, day, employee) => {
                    if (canEdit) {
                      setEditingCell({ empId, date: dateKey, day, employee, mode: 'edit' });
                    } else if (currentUser && currentUser.nip === empId) {
                      setEditingCell({ empId, date: dateKey, day, employee, mode: 'swap' });
                    }
                  }}
                  onEmployeeClick={(empId) => { setSelectedIndividualId(empId); setActiveView('individual'); }}
                />
              </div>

              {/* Mobile List View */}
              <div className="lg:hidden">
                <MobileRosterList
                  employees={filteredEmployees}
                  daysArray={daysArray}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  getRecordForCell={getRecordForCell}
                  canEdit={!!canEdit}
                  currentUser={currentUser}
                  masterShifts={masterShifts}
                  masterUnits={masterUnits}
                  onCellClick={(empId, dateKey, day, employee) => {
                    if (canEdit) {
                      setEditingCell({ empId, dateKey, day, employee, mode: 'edit' });
                    } else if (currentUser && currentUser.nip === empId) {
                      setEditingCell({ empId, dateKey, day, employee, mode: 'swap' });
                    }
                  }}
                />
              </div>


              <div className="mt-6">
                <Legend
                  masterShifts={masterShifts}
                  masterUnits={masterUnits}
                  canEdit={currentUser?.role === 'admin' || currentUser?.role === 'supervisor'}
                  onRefresh={refreshData}
                />
              </div>
            </div>
          )}

          {activeView === 'individual' && (
            <IndividualView selectedEmployee={selectedEmployee} roster={roster} daysArray={daysArray} />
          )}

          {activeView === 'employees' && <EmployeeManager onUserChange={refreshData} />}
          {activeView === 'settings' && <SettingsManager onSettingsChange={refreshData} />}

        </main>
      </div >

      {/* Edit/Swap Modal */}
      <Modal isOpen={!!editingCell} onClose={() => setEditingCell(null)}>
        {editingCell && editingCell.mode === 'edit' && (
          <AssignmentPanel
            key={`${editingCell.empId}-${editingCell.date}`} // FORCE RE-MOUNT ON CHANGE
            employee={editingCell.employee}
            initialDate={editingCell.date}
            initialShift={getRecordForCell(editingCell.empId, editingCell.date)?.shiftCode}
            initialTask={getRecordForCell(editingCell.empId, editingCell.date)?.taskCode}
            onSave={(date, shiftCode, taskCode) => handleUpdateShiftV2(date, shiftCode, taskCode)}
            onDelete={() => deleteScheduleRecord(editingCell.empId, editingCell.date)}
            isNew={!getRecordForCell(editingCell.empId, editingCell.date)}
            onClose={() => setEditingCell(null)}
          />
        )}
        {editingCell && editingCell.mode === 'swap' && currentUser && (
          <SwapRequestModal
            sourceRecord={getRecordForCell(editingCell.empId, editingCell.date) || { employeeId: editingCell.empId, date: editingCell.date, shiftCode: 'OFF' }}
            currentUser={currentUser}
            employees={employees}
            roster={roster}
            onClose={() => setEditingCell(null)}
          />
        )}
      </Modal>

      {/* Swap List/Approvals Modal */}
      <Modal isOpen={showSwapList} onClose={() => setShowSwapList(false)}>
        {currentUser && <SwapApprovalsModal onClose={() => setShowSwapList(false)} currentUserRole={currentUser.role} />}
      </Modal>


      <Toaster position="top-right" richColors />
    </div >
  );
};

export default App;
