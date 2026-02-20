import React from 'react';
import { Outlet } from 'react-router-dom';

export const TaxLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-blue-900 text-white p-4 shadow-sm">
                <div className="container mx-auto flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold">
                        TR
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Tax Refund Portal</h1>
                        <p className="text-xs opacity-80">Official Government Gateway</p>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8 max-w-4xl">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <Outlet />
                </div>
            </main>

            <footer className="bg-gray-100 text-gray-500 py-6 mt-12 text-center text-sm border-t border-gray-200">
                <p>&copy; 2026 Department of Fiscal Adjustments. All rights reserved.</p>
                <div className="mt-2 flex justify-center gap-4">
                    <span className="hover:underline cursor-pointer">Privacy Policy</span>
                    <span className="hover:underline cursor-pointer">Accessibility</span>
                    <span className="hover:underline cursor-pointer">Contact</span>
                </div>
            </footer>
        </div>
    );
};
