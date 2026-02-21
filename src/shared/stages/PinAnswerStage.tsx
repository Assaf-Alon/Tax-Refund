import React, { useState, useEffect } from 'react';
import { PinPad } from '../ui/PinPad';
import { HintButton } from '../ui/HintButton';
import type { PinAnswerTheme } from './types';

export interface PinAnswerStageProps {
    correctPin: string;
    title: string;
    prompt: string;
    hint?: string;
    hintCooldown?: number;
    onAdvance: () => void;
    theme?: PinAnswerTheme;
}

export const PinAnswerStage: React.FC<PinAnswerStageProps> = ({
    correctPin,
    title,
    prompt,
    hint,
    hintCooldown = 60,
    onAdvance,
    theme,
}) => {
    const [pin, setPin] = useState('');
    const [shaking, setShaking] = useState(false);

    useEffect(() => {
        if (pin.length === correctPin.length) {
            if (pin === correctPin) {
                onAdvance();
            } else {
                setShaking(true);
                setTimeout(() => {
                    setShaking(false);
                    setPin('');
                }, 500);
            }
        }
    }, [pin, correctPin, onAdvance]);

    const handleDigit = (digit: string) => {
        if (pin.length < correctPin.length) {
            setPin(prev => prev + digit);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className={theme?.container ?? 'text-center space-y-8 w-full max-w-sm'}>
            <h2 className={theme?.title ?? 'text-2xl font-bold'}>{title}</h2>
            <p className={theme?.promptText ?? 'text-sm opacity-60'}>{prompt}</p>

            <div className={`flex justify-center gap-2 ${shaking ? (theme?.shakeAnimation ?? 'animate-shake') : ''}`}>
                {Array.from({ length: correctPin.length }, (_, i) => (
                    <span
                        key={i}
                        className={`w-4 h-4 rounded-full inline-block mx-1 transition-colors duration-200 ${i < pin.length
                                ? (theme?.dotFilled ?? 'bg-white')
                                : (theme?.dotEmpty ?? 'bg-gray-700')
                            }`}
                    />
                ))}
            </div>

            <PinPad
                onDigit={handleDigit}
                onBackspace={handleBackspace}
                buttonClassName={theme?.pinButton}
            />

            {hint && <HintButton hint={hint} cooldownSeconds={hintCooldown} />}
        </div>
    );
};
