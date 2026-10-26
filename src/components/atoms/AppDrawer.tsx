import { useState, useRef, useEffect } from 'react';
import { ExternalLink, LayoutGrid } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SSOModule } from '../../context/AuthContext';
import { ssoApi, getCookie } from '../../services/api';

interface AppDrawerProps {
    modules?: SSOModule[];
    currentModuleCode?: string;
}

export const AppDrawer = ({ modules: initialModules = [], currentModuleCode = 'PR_NON_TRADE' }: AppDrawerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fetchedModules, setFetchedModules] = useState<SSOModule[]>(initialModules);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const response = await ssoApi.getModules();
                if (response.modules) {
                    const mappedModules = response.modules.map((m: any) => ({
                        code: m.module,
                        name: m.name || m.module,
                        redirect_url: m.redirect_url || ''
                    }));
                    setFetchedModules(mappedModules);
                }
            } catch (error) {
                console.error("Failed to fetch modules", error);
            }
        };

        fetchModules();
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleModuleClick = (mod: SSOModule) => {
        if (mod.code === currentModuleCode) {
            setIsOpen(false);
            return;
        }
        const token = getCookie('sso_token') || localStorage.getItem('sso_token');
        if (mod.redirect_url && token) {
            const separator = mod.redirect_url.includes('?') ? '&' : '?';
            window.location.href = `${mod.redirect_url}${separator}token=${token}`;
        }
    };

    const ssoUrl = import.meta.env.VITE_SSO_URL;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="Applications (SSO Apps)"
            >
                <LayoutGrid size={20} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        aria-hidden="true"
                        onClick={() => setIsOpen(false)}
                    />

                    <div
                        className={cn(
                            "absolute right-0 mt-2 z-50",
                            "w-[290px] bg-white rounded-2xl shadow-2xl border border-slate-200",
                            "origin-top-right",
                            "animate-fade-in"
                        )}
                    >
                        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                SSO Applications
                            </h3>
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                Portal PR
                            </span>
                        </div>

                        <div className="p-3 max-h-80 overflow-y-auto">
                            {fetchedModules.length === 0 ? (
                                <div className="px-4 py-6 text-center text-xs text-slate-400">
                                    Tidak ada modul aplikasi lain.
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {fetchedModules.map((mod) => {
                                        const isCurrent = mod.code === currentModuleCode;
                                        return (
                                            <button
                                                key={mod.code}
                                                onClick={() => handleModuleClick(mod)}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all duration-200 cursor-pointer group text-center",
                                                    isCurrent
                                                        ? "bg-blue-50 ring-1 ring-blue-300"
                                                        : "hover:bg-slate-50"
                                                )}
                                                title={mod.name || mod.code}
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center transition-colors text-slate-600">
                                                    <LayoutGrid size={20} />
                                                </div>
                                                <span className="text-[11px] font-medium text-slate-700 leading-tight line-clamp-2 w-full">
                                                    {mod.name || mod.code}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {ssoUrl && (
                            <div className="border-t border-slate-100 px-4 py-3 flex justify-center bg-slate-50/60 rounded-b-2xl">
                                <a
                                    href={ssoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                    SSO Dashboard
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AppDrawer;
