import { useState, useEffect } from 'react';
import { loadState } from '../../shared/logic/gameState';
import { AdminDashboard } from './AdminDashboard';
import { PinPad } from '../../shared/ui/PinPad';

const ADMIN_PIN = '0000';

export const PinGate: React.FC = () => {
    const isDev = import.meta.env.DEV;
    const state = loadState();
    const bypassEnabled = isDev && state.adminSettings.bypassPinOnLocalhost;

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

    return (
        <div className="flex flex-col items-center gap-8 py-8">
            <h2 className="text-xl font-semibold text-gray-700">Enter Admin PIN</h2>

            <div className={`flex gap-2 ${shaking ? 'animate-shake' : ''}`}>
                {dots}
            </div>

            <PinPad onDigit={handleDigit} onBackspace={handleBackspace} />
        </div>
    );
};
