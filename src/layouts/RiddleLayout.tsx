import React from 'react';
import { Outlet } from 'react-router-dom';

export const RiddleLayout: React.FC = () => {
    return (
        <div className="min-h-screen min-w-full bg-slate-900 text-green-400 font-mono tracking-wide selection:bg-green-900 selection:text-white overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900 via-transparent to-transparent"></div>

            <header className="p-4 border-b border-green-900/30 flex justify-between items-center bg-black/20 backdrop-blur-sm sticky top-0 z-10">
                <div className="text-xs uppercase tracking-[0.2em] opacity-50">System Override: Active</div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse box-shadow-green"></div>
            </header>

            <main className="container mx-auto p-4 md:p-12 min-h-[80vh] flex flex-col items-center justify-center relative z-0">
                <Outlet />
            </main>

            <footer className="text-center p-8 text-xs opacity-30 text-green-600">
                <p>encrypted_channel_v4.2 // end_of_transmission</p>
            </footer>
        </div>
    );
};
