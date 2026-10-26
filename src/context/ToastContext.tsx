import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 5000);
    }, []);

    const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
    const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, success, error, info }}>
            {children}
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                            className={clsx(
                                "pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border min-w-[320px] max-w-md bg-white",
                                {
                                    'border-emerald-200 text-emerald-900 ring-1 ring-emerald-500/10': toast.type === 'success',
                                    'border-rose-200 text-rose-900 ring-1 ring-rose-500/10': toast.type === 'error',
                                    'border-blue-200 text-blue-900 ring-1 ring-blue-500/10': toast.type === 'info',
                                }
                            )}
                        >
                            <div className="shrink-0 mt-0.5">
                                {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-600" />}
                                {toast.type === 'error' && <AlertCircle size={18} className="text-rose-600" />}
                                {toast.type === 'info' && <Info size={18} className="text-blue-600" />}
                            </div>
                            <div className="flex-1 text-xs md:text-sm font-medium whitespace-pre-wrap leading-relaxed">
                                {toast.message}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
