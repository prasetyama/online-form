import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50/70 font-poppins">
            <Sidebar 
                isExpanded={isSidebarExpanded} 
                setIsExpanded={setIsSidebarExpanded}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />
            
            <div className={`transition-all duration-300 ${isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-20'} pl-0 min-h-screen flex flex-col`}>
                <Header onMenuClick={() => setIsMobileOpen(true)} />
                <main className="flex-1 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Backdrop Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-xs"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </div>
    );
};
