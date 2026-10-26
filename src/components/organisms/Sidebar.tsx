import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FileText, PlusCircle, ExternalLink, ChevronLeft, ChevronRight, X,
    Package, Layers, ShieldCheck, LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isExpanded,
    setIsExpanded,
    isMobileOpen,
    setIsMobileOpen
}) => {
    const { user, logout } = useAuth();
    const approvalUrl = import.meta.env.VITE_APPROVAL_URL || 'http://localhost:5175';

    const navItems = [
        {
            name: 'Daftar Pengajuan PR',
            href: '/',
            icon: FileText,
            badge: null
        },
        {
            name: 'Buat PR Baru',
            href: '/create',
            icon: PlusCircle,
            badge: 'Form'
        },
    ];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white shadow-sm transition-all duration-300 flex flex-col",
                isExpanded ? "w-64" : "w-20",
                isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
        >
            <div className="flex flex-col flex-1 h-0 px-3 py-4 relative">
                {/* Mobile Close Button */}
                <button
                    className="absolute top-4 -right-12 lg:hidden p-2 text-white bg-slate-900/80 rounded-xl cursor-pointer"
                    onClick={() => setIsMobileOpen(false)}
                >
                    <X size={24} />
                </button>

                {/* App Brand Header */}
                <div className={cn("mb-6 flex items-center py-2", isExpanded ? "px-2" : "justify-center")}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/20">
                        <Package size={22} />
                    </div>
                    {isExpanded && (
                        <div className="ml-3 overflow-hidden">
                            <span className="text-base font-extrabold tracking-tight text-slate-900 block whitespace-nowrap">
                                PR <span className="text-blue-600">PORTAL</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block whitespace-nowrap">
                                Non-Trade & Trade
                            </span>
                        </div>
                    )}
                </div>

                {/* Section Header with Collapse Toggle */}
                <div className={cn(
                    "flex items-center mb-3 transition-all duration-300",
                    isExpanded ? "justify-between px-3" : "justify-center px-1"
                )}>
                    {isExpanded && (
                        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Menu Utama
                        </h2>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                        title={isExpanded ? "Kecilkan Sidebar" : "Perbesar Sidebar"}
                    >
                        {isExpanded ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.href === '/'}
                                onClick={() => setIsMobileOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 group",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                        !isExpanded && "justify-center px-2"
                                    )
                                }
                                title={!isExpanded ? item.name : undefined}
                            >
                                <Icon size={20} className={cn("shrink-0 transition-transform group-hover:scale-105")} />
                                {isExpanded && (
                                    <div className="ml-3 flex-1 flex items-center justify-between overflow-hidden">
                                        <span className="truncate">{item.name}</span>
                                        {item.badge && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}

                    {/* External Link to Approval Hub */}
                    <div className="pt-4 mt-4 border-t border-slate-100">
                        {isExpanded && (
                            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Integrasi
                            </div>
                        )}
                        <a
                            href={approvalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors group",
                                !isExpanded && "justify-center px-2"
                            )}
                            title={!isExpanded ? "Approval Workflow Hub" : undefined}
                        >
                            <ShieldCheck size={20} className="shrink-0 text-blue-600" />
                            {isExpanded && (
                                <div className="ml-3 flex-1 flex items-center justify-between overflow-hidden">
                                    <span className="truncate">Approval Hub</span>
                                    <ExternalLink size={14} className="text-slate-400" />
                                </div>
                            )}
                        </a>
                    </div>
                </nav>

                {/* Footer User Profile Card */}
                <div className="pt-3 border-t border-slate-100 mt-auto">
                    {isExpanded ? (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-800 truncate">
                                    {user?.name || user?.username}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                    {user?.department || 'User'}
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <button
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
