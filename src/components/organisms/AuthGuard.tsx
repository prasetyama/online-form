import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="relative flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                    <Loader2 size={24} className="absolute text-blue-600 animate-pulse" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-slate-800">Memverifikasi Sesi SSO...</p>
                    <p className="text-xs text-slate-400 mt-1">Menghubungkan ke Centralized SSO & Approval Backend</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};
