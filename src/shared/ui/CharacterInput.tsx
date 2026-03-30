import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface CharacterInputHandle {
    /** Focus the first editable input */
    focus: () => void;
}

interface CharacterInputProps {
    /** A single word (no spaces). All alpha/numeric chars are editable; apostrophes are static. */
    expectedValue: string;
    onComplete: () => void;
    /** Controlled value: if provided, CharacterInput uses this array for display. */
    value?: string[];
    /** Controlled active index: highlight the character box at this index. */
    activeIndex?: number;
    /** Callback when a specific character box is clicked/focused. */
    onCharFocus?: (index: number) => void;
    /** If true, uses inputMode="none" to prevent OS keyboard but maintains focus. */
    readOnlyMode?: boolean;
    /** When true, all inputs become read-only with a green border */
    locked?: boolean;
    /** Focus first input on mount */
    autoFocus?: boolean;
    /** Custom border color classes (e.g. 'border-blue-500') */
    borderColor?: {
        locked?: string;
        unlocked?: string;
    };
    /** Custom text color classes (e.g. 'text-blue-300') */
    textColor?: {
        locked?: string;
        unlocked?: string;
    };
    /** Custom background color class (e.g. 'bg-white') */
    backgroundColor?: string;
    /** Callback when any input in the group is focused */
    onFocus?: () => void;
}

/**
 * Hangman-style character input for a single word.
 * Apostrophes are rendered as static characters.
 * Use `ref` to imperatively focus the first input.
 */
export const CharacterInput = forwardRef<CharacterInputHandle, CharacterInputProps>(({
    expectedValue,
    onComplete,
    value: controlledValues,
    activeIndex,
    onCharFocus,
    readOnlyMode = false,
    locked = false,
    autoFocus = false,
    borderColor,
    textColor,
    backgroundColor,
    onFocus,
}, ref) => {
    const chars = expectedValue.split('');
    const [internalValues, setInternalValues] = useState<string[]>(() => chars.map(() => ''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Use controlled values if provided, otherwise internal values
    const effectiveValues = controlledValues || internalValues;
    const isControlled = !!controlledValues;

    // A character is static (non-editable) if it's not alphanumeric
    const isStatic = (ch: string) => /[^a-zA-Z0-9]/.test(ch);

    // Pre-fill static chars in internal state if not controlled
    useEffect(() => {
        if (!isControlled) {
            setInternalValues(chars.map(ch => (isStatic(ch) ? ch : '')));
        }
    }, [expectedValue, isControlled]);

    // Reactive focus when autoFocus changes to true
    useEffect(() => {
        if (autoFocus && !readOnlyMode) {
            const firstIdx = chars.findIndex(ch => !isStatic(ch));
            if (firstIdx !== -1) {
                if (document.activeElement !== inputRefs.current[firstIdx]) {
                    inputRefs.current[firstIdx]?.focus();
                }
            }
        }
    }, [autoFocus, readOnlyMode]);

    // Expose focus method via ref
    useImperativeHandle(ref, () => ({
        focus: () => {
            const firstIdx = chars.findIndex(ch => !isStatic(ch));
            if (firstIdx !== -1) {
                inputRefs.current[firstIdx]?.focus();
            }
        },
    }));

    // Check completion whenever values change
    useEffect(() => {
        const joined = effectiveValues.join('').toLowerCase();
        if (joined.length > 0 && joined === expectedValue.toLowerCase()) {
            onComplete();
        }
    }, [effectiveValues, expectedValue, onComplete]);

    const findNextInput = (fromIndex: number): number => {
        for (let i = fromIndex + 1; i < chars.length; i++) {
            if (!isStatic(chars[i])) return i;
        }
        return -1;
    };

    const findPrevInput = (fromIndex: number): number => {
        for (let i = fromIndex - 1; i >= 0; i--) {
            if (!isStatic(chars[i])) return i;
        }
        return -1;
    };

    const handleChange = (index: number, value: string) => {
        if (locked || isStatic(chars[index]) || isControlled) return;

        const newValues = [...internalValues];
        
        if (!internalValues[index] && value.length > 1) {
            const first = value[0];
            const second = value[1];
            newValues[index] = first;
            
            const nextIdx = findNextInput(index);
            if (nextIdx !== -1) {
                newValues[nextIdx] = second;
                setInternalValues(newValues);
                const nextNextIdx = findNextInput(nextIdx);
                requestAnimationFrame(() => {
                    inputRefs.current[nextNextIdx !== -1 ? nextNextIdx : nextIdx]?.focus();
                });
                return;
            }
        }

        const char = value.slice(-1);
        newValues[index] = char;
        setInternalValues(newValues);

        if (char) {
            const nextIdx = findNextInput(index);
            if (nextIdx !== -1) {
                requestAnimationFrame(() => {
                    inputRefs.current[nextIdx]?.focus();
                });
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (locked || isControlled) return;
        if (e.key === ' ') {
            e.preventDefault();
            return;
        }
        if (e.key === 'Backspace') {
            if (!internalValues[index]) {
                const prevIdx = findPrevInput(index);
                if (prevIdx !== -1) {
                    const newValues = [...internalValues];
                    newValues[prevIdx] = '';
                    setInternalValues(newValues);
                    inputRefs.current[prevIdx]?.focus();
                }
                e.preventDefault();
            }
        }
    };

    const borderColorClass = locked
        ? (borderColor?.locked ?? 'border-green-500/70')
        : (borderColor?.unlocked ?? 'border-pink-500');
    const textColorClass = locked
        ? (textColor?.locked ?? 'text-green-300')
        : (textColor?.unlocked ?? 'text-pink-200');

    return (
        <span className="inline-flex gap-0.5 whitespace-nowrap" role="group">
            {chars.map((ch, i) => {
                if (isStatic(ch)) {
                    return (
                        <span
                            key={i}
                            className="w-6 h-8 sm:w-8 sm:h-10 flex items-center justify-center text-[#ff007f]/60 text-sm sm:text-lg font-mono"
                            data-testid={`static-${i}`}
                        >
                            {ch}
                        </span>
                    );
                }

                const isActive = activeIndex === i;

                return (
                    <input
                        key={i}
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        maxLength={2}
                        value={effectiveValues[i] || ''}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        onFocus={() => {
                            onFocus?.();
                            onCharFocus?.(i);
                        }}
                        readOnly={locked || readOnlyMode}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        inputMode={readOnlyMode ? 'none' : 'text'}
                        className={`
                            w-6 h-8 sm:w-8 sm:h-10 text-center ${backgroundColor ?? 'bg-black'} ${borderColorClass} border ${textColorClass} rounded-sm font-mono text-sm sm:text-lg focus:outline-none focus:ring-1 focus:ring-[#ff007f] focus:border-[#ff007f] transition-all cursor-pointer
                            ${isActive ? 'border-b-2 !border-pink-500 ring-1 ring-pink-500/50 scale-105' : ''}
                        `}
                        placeholder={isActive ? '' : '_'}
                        aria-label={`Character ${i + 1}`}
                        data-testid={`input-${i}`}
                    >
                    </input>
                );
            })}
            <style>{`
                @keyframes pulse-border {
                    0%, 100% { border-bottom-color: rgba(236, 72, 153, 1); }
                    50% { border-bottom-color: rgba(236, 72, 153, 0.3); }
                }
                .animate-pulse-border {
                    animation: pulse-border 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </span>
    );
})


CharacterInput.displayName = 'CharacterInput';
