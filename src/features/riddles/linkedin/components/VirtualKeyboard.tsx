import React from 'react';

interface VirtualKeyboardProps {
    onKey: (key: string) => void;
    onBackspace: () => void;
    onEnter: () => void;
    className?: string;
}

const KEYS_ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const KEYS_ROW_2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const KEYS_ROW_3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    onKey,
    onBackspace,
    onEnter,
    className = '',
}) => {
    return (
        <div className={`w-full max-w-md mx-auto p-2 flex flex-col gap-2 select-none ${className}`}>
            {/* Row 1 */}
            <div className="flex justify-center gap-1.5 w-full">
                {KEYS_ROW_1.map((key) => (
                    <button
                        key={key}
                        onClick={() => onKey(key)}
                        className="flex-1 h-12 min-w-[30px] rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-sm shadow-sm active:scale-95 active:bg-gray-100 dark:active:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                    >
                        {key}
                    </button>
                ))}
            </div>

            {/* Row 2 */}
            <div className="flex justify-center gap-1.5 w-full px-4">
                {KEYS_ROW_2.map((key) => (
                    <button
                        key={key}
                        onClick={() => onKey(key)}
                        className="flex-1 h-12 min-w-[30px] rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-sm shadow-sm active:scale-95 active:bg-gray-100 dark:active:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                    >
                        {key}
                    </button>
                ))}
            </div>

            {/* Row 3 */}
            <div className="flex justify-center gap-1.5 w-full">
                <button
                    onClick={onBackspace}
                    className="flex-[1.5] h-12 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-xs shadow-sm active:scale-95 active:bg-gray-300 dark:active:bg-gray-500 transition-all border border-gray-300 dark:border-gray-500 flex items-center justify-center p-0"
                    aria-label="Backspace"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414A2 2 0 0010.828 19H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                    </svg>
                </button>

                {KEYS_ROW_3.map((key) => (
                    <button
                        key={key}
                        onClick={() => onKey(key)}
                        className="flex-1 h-12 min-w-[30px] rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-sm shadow-sm active:scale-95 active:bg-gray-100 dark:active:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                    >
                        {key}
                    </button>
                ))}

                <button
                    onClick={onEnter}
                    className="flex-[1.5] h-12 rounded-md bg-[#ff007f] text-white font-bold text-xs shadow-sm active:scale-95 active:brightness-90 transition-all border border-[#ff007f] uppercase tracking-wider"
                >
                    Enter
                </button>
            </div>
        </div>
    );
};
