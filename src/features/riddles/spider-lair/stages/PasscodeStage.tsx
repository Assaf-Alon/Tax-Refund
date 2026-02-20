import React, { useState, useEffect } from 'react';
import { PinPad } from '../../../../shared/ui/PinPad';
import { HintButton } from '../../../../shared/ui/HintButton';

interface PasscodeStageProps {
    onAdvance: () => void;
}

const CORRECT_PIN = '2468';

export const PasscodeStage: React.FC<PasscodeStageProps> = ({ onAdvance }) => {
    const [pin, setPin] = useState('');
    const [shaking, setShaking] = useState(false);

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === CORRECT_PIN) {
                onAdvance();
            } else {
                setShaking(true);
                setTimeout(() => {
                    setShaking(false);
                    setPin('');
                }, 500);
            }
        }
    }, [pin, onAdvance]);

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
            className={`w-4 h-4 rounded-full inline-block mx-1 transition-colors duration-200 ${i < pin.length
                ? 'bg-[#ff007f] shadow-[0_0_10px_rgba(255,0,127,0.6)]'
                : 'bg-gray-700 border border-[#b0005d]'
                }`}
        />
    ));

    const pinButtonClass =
        'w-12 h-12 text-2xl bg-black/50 hover:bg-[#ff007f]/20 border border-[#b0005d] hover:border-[#ff007f] rounded font-semibold transition-all duration-200 text-pink-200';

    return (
        <div className="text-center space-y-8 w-full max-w-sm">
            <h2 className="text-2xl text-[#ff007f]">The Web Lock</h2>
            <p className="text-pink-200/70 text-sm">The spider demands a code. Four numbers... always even.</p>

            <div className={`flex justify-center gap-2 ${shaking ? 'animate-shake' : ''}`}>
                {dots}
            </div>

            <PinPad
                onDigit={handleDigit}
                onBackspace={handleBackspace}
                buttonClassName={pinButtonClass}
            />

            <HintButton hint="Count by twos..." cooldownSeconds={60} />
        </div>
    );
};
