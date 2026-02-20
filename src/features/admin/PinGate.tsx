import { useState, useEffect } from 'react';
import { loadState } from '../../shared/logic/gameState';
import { AdminDashboard } from './AdminDashboard';

const ADMIN_PIN = '0000';

export const PinGate: React.FC = () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const state = loadState();
    const bypassEnabled = isLocalhost && state.adminSettings.bypassPinOnLocalhost;

    const [unlocked, setUnlocked] = useState(bypassEnabled);
    const [pin, setPin] = useState('');
    const [shaking, setShaking] = useState(false);

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === ADMIN_PIN) {
                setUnlocked(true);
            } else {
                setShaking(true);
                setTimeout(() => {
                    setShaking(false);
                    setPin('');
                }, 500);
            }
        }
    }, [pin]);

    if (unlocked) return <AdminDashboard />;

    const handleDigit = (digit: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const dots = Array.from({ length: 4 }, (_, i) => (
        <span
            key={i}
            className={`w-4 h-4 rounded-full inline-block mx-1 ${i < pin.length ? 'bg-blue-900' : 'bg-gray-300'
                }`}
        />
    ));

    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return (
        <div className="flex flex-col items-center gap-8 py-8">
            <h2 className="text-xl font-semibold text-gray-700">Enter Admin PIN</h2>

            <div className={`flex gap-2 ${shaking ? 'animate-shake' : ''}`}>
                {dots}
            </div>

            <div className="grid grid-cols-3 gap-2">
                {digits.map(d => (
                    <button
                        key={d}
                        onClick={() => handleDigit(d)}
                        className="w-14 h-14 text-2xl bg-gray-200 hover:bg-gray-300 rounded font-semibold transition-colors"
                    >
                        {d}
                    </button>
                ))}
                <button
                    onClick={handleBackspace}
                    className="w-14 h-14 text-2xl bg-gray-200 hover:bg-gray-300 rounded font-semibold transition-colors"
                >
                    ←
                </button>
                <button
                    onClick={() => handleDigit('0')}
                    className="w-14 h-14 text-2xl bg-gray-200 hover:bg-gray-300 rounded font-semibold transition-colors"
                >
                    0
                </button>
                <div className="w-14 h-14" /> {/* empty cell */}
            </div>
        </div>
    );
};
