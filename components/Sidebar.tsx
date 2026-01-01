
import React from 'react';
import { Calendar, Users, User as UserIcon, Settings, ShieldCheck, PieChart, Menu, X } from 'lucide-react';
import { UserRole, User } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    sidebarOpen: boolean;
    activeView: 'global' | 'individual' | 'employees' | 'settings';
    setActiveView: (view: 'global' | 'individual' | 'employees' | 'settings') => void;
    setSidebarOpen: (open: boolean) => void;
    currentUser: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
    sidebarOpen, activeView, setActiveView, setSidebarOpen, currentUser
}) => {
    return (
        <aside className={cn(
            "fixed lg:relative z-[100] h-full bg-[#0F172A] border-r border-indigo-900/20 text-slate-300 transition-all duration-300 shadow-2xl",
            sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-72"
        )}>
            {/* Header */}
            <div className="h-20 flex items-center px-6 border-b border-indigo-500/10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Calendar size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            ROSTER PRO
                        </h1>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                            CSSD Hospital
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden ml-auto p-2 text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100%-160px)] custom-scrollbar">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu Utama</div>

                <NavItem
                    active={activeView === 'global'}
                    onClick={() => { setActiveView('global'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                    icon={<Users size={20} />}
                    label="Jadwal Global"
                    description="Lihat jadwal utama"
                />
                <NavItem
                    active={activeView === 'individual'}
                    onClick={() => { setActiveView('individual'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                    icon={<UserIcon size={20} />}
                    label="Jadwal Saya"
                    description="Kalender shift pribadi"
                />

                {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPERVISOR) && (
                    <>
                        <div className="px-4 py-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administrator</div>
                        <NavItem
                            active={activeView === 'employees'}
                            onClick={() => { setActiveView('employees'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                            icon={<ShieldCheck size={20} />}
                            label="Pegawai"
                            description="Manajemen data staff"
                        />
                        <NavItem
                            onClick={() => { setActiveView('settings'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                            icon={<Settings size={20} />}
                            label="Pengaturan"
                            description="Konfigurasi sistem"
                        />
                    </>
                )}
            </nav>

            {/* User Profile */}
            <div className="absolute bottom-0 w-full p-4 border-t border-indigo-500/10 bg-[#0B1120]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold border-2 border-slate-700">
                        {currentUser?.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                        <p className="text-[10px] font-medium text-indigo-400 uppercase tracking-wider">{currentUser?.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    description?: string;
    active?: boolean;
    onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, description, active, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left relative overflow-hidden",
            active
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
        )}
    >
        {active && (
            <div className="absolute left-0 top-0 h-full w-1 bg-indigo-400" />
        )}
        <div className={cn(
            "shrink-0 transition-colors",
            active ? "text-indigo-200" : "text-slate-500 group-hover:text-indigo-400"
        )}>
            {icon}
        </div>
        <div>
            <span className={cn("text-sm font-bold block leading-tight", active ? "text-white" : "")}>{label}</span>
            {description && <span className={cn("text-[10px] opacity-70 block mt-0.5", active ? "text-indigo-200" : "text-slate-500")}>{description}</span>}
        </div>
    </button>
);

