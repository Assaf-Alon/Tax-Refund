import React from 'react';

interface PinPadProps {
    onDigit: (digit: string) => void;
    onBackspace: () => void;
    /** Optional Tailwind classes for each key button */
    buttonClassName?: string;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const PinPad: React.FC<PinPadProps> = ({
    onDigit,
    onBackspace,
    buttonClassName = 'w-12 h-12 text-2xl bg-gray-200 hover:bg-gray-300 rounded font-semibold transition-colors',
}) => {
    return (
        <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
            {DIGITS.map(d => (
                <button
                    key={d}
                    onClick={() => onDigit(d)}
                    className={buttonClassName}
                >
                    {d}
                </button>
            ))}
            <button
                onClick={onBackspace}
                className={buttonClassName}
            >
                ←
            </button>
            <button
                onClick={() => onDigit('0')}
                className={buttonClassName}
            >
                0
            </button>
            <button className={buttonClassName} style={{ visibility: 'hidden' }} aria-hidden="true" />
        </div>
    );
};
