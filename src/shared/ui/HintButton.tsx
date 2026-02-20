import React, { useState, useEffect } from 'react';

interface HintButtonProps {
    hint: string;
    cooldownSeconds: number;
}

export const HintButton: React.FC<HintButtonProps> = ({ hint, cooldownSeconds }) => {
    const [timeLeft, setTimeLeft] = useState(cooldownSeconds);
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []); // Session-only: timer starts on mount, resets on refresh

    const handleClick = () => {
        if (timeLeft === 0) {
            setShowHint(true);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={handleClick}
                disabled={timeLeft > 0}
                className={`px-4 py-2 rounded text-sm uppercase tracking-wider transition-all duration-300 ${timeLeft > 0
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                        : 'bg-[#ff007f]/20 border border-[#ff007f]/50 hover:bg-[#ff007f]/30 text-[#ff007f] cursor-pointer'
                    }`}
            >
                {timeLeft > 0 ? `Hint (${timeLeft}s)` : 'Show Hint'}
            </button>
            {showHint && (
                <p className="text-[#ff007f]/80 text-sm italic animate-pulse">
                    {hint}
                </p>
            )}
        </div>
    );
};
