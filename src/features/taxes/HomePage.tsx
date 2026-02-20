import React from 'react';

export const HomePage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome to the Tax Refund Portal</h2>
            <p className="text-gray-600">
                Please use the navigation menu to access your tax documents, file appeals, or check your refund status.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded">
                    <h3 className="font-semibold text-blue-900">Check Refund Status</h3>
                    <p className="text-sm text-blue-800 mt-2">View the current status of your filed returns.</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded">
                    <h3 className="font-semibold text-gray-900">Download Forms</h3>
                    <p className="text-sm text-gray-600 mt-2">Access current year tax forms and instructions.</p>
                </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
                <strong>Notice:</strong> System maintenance scheduled for this weekend.
            </div>
        </div>
    );
};
