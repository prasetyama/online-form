import React from 'react';
import { Menu, LogOut, ExternalLink, ShieldCheck, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppDrawer } from '../atoms/AppDrawer';

interface HeaderProps {
    onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const approvalUrl = import.meta.env.VITE_APPROVAL_URL || 'http://localhost:5175';

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 lg:px-8 backdrop-blur-md shadow-xs">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl lg:hidden cursor-pointer"
                        title="Toggle Sidebar"
                    >
                        <Menu size={20} />
                    </button>
                )}
                <div>
                    <h1 className="text-base font-bold text-slate-800 hidden sm:block">
                        Online Form
                    </h1>
                    <p className="text-xs text-slate-400 hidden sm:block">
                        Purchase Request Non-Trade & Trade
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">

                {/* SSO App Drawer */}
                <AppDrawer />

                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                {/* User Details & Logout */}
                <div className="flex items-center gap-2.5 pl-1">
                    <div className="flex items-center gap-2">
                        {user?.image ? (
                            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                {(user?.name || user?.first_name || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                                {user?.name || user?.first_name || 'User'}
                            </p>
                            <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                                {user?.role_name || 'Staff'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Logout SSO"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};
