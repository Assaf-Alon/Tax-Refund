import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface CharacterInputHandle {
    /** Focus the first editable input */
    focus: () => void;
}

interface CharacterInputProps {
    /** A single word (no spaces). All alpha/numeric chars are editable; apostrophes are static. */
    expectedValue: string;
    onComplete: () => void;
    /** When true, all inputs become read-only with a green border */
    locked?: boolean;
    /** Focus first input on mount */
    autoFocus?: boolean;
}

/**
 * Hangman-style character input for a single word.
 * Apostrophes are rendered as static characters.
 * Use `ref` to imperatively focus the first input.
 */
export const CharacterInput = forwardRef<CharacterInputHandle, CharacterInputProps>(({
    expectedValue,
    onComplete,
    locked = false,
    autoFocus = false,
}, ref) => {
    const chars = expectedValue.split('');
    const [values, setValues] = useState<string[]>(() => chars.map(() => ''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // A character is static (non-editable) if it's not alphanumeric
    const isStatic = (ch: string) => /[^a-zA-Z0-9]/.test(ch);

    // Pre-fill static chars
    useEffect(() => {
        setValues(chars.map(ch => (isStatic(ch) ? ch : '')));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expectedValue]);

    // Auto-focus on mount
    useEffect(() => {
        if (autoFocus) {
            const firstIdx = chars.findIndex(ch => !isStatic(ch));
            if (firstIdx !== -1) {
                inputRefs.current[firstIdx]?.focus();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        const joined = values.join('').toLowerCase();
        if (joined.length > 0 && joined === expectedValue.toLowerCase()) {
            onComplete();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values]);

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
        if (locked || isStatic(chars[index])) return;

        const char = value.slice(-1);
        const newValues = [...values];
        newValues[index] = char;
        setValues(newValues);

        if (char) {
            const nextIdx = findNextInput(index);
            if (nextIdx !== -1) {
                inputRefs.current[nextIdx]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (locked) return;
        if (e.key === ' ') {
            e.preventDefault();
            return;
        }
        if (e.key === 'Backspace') {
            if (!values[index]) {
                const prevIdx = findPrevInput(index);
                if (prevIdx !== -1) {
                    const newValues = [...values];
                    newValues[prevIdx] = '';
                    setValues(newValues);
                    inputRefs.current[prevIdx]?.focus();
                }
                e.preventDefault();
            }
        }
    };

    const borderColor = locked
        ? 'border-green-500/70'
        : 'border-pink-500';
    const textColor = locked
        ? 'text-green-300'
        : 'text-pink-200';

    return (
        <span className="inline-flex gap-0.5 whitespace-nowrap" role="group">
            {chars.map((ch, i) => {
                if (isStatic(ch)) {
                    return (
                        <span
                            key={i}
                            className={`w-6 h-8 sm:w-8 sm:h-10 flex items-center justify-center text-[#ff007f]/60 text-sm sm:text-lg font-mono`}
                            data-testid={`static-${i}`}
                        >
                            {ch}
                        </span>
                    );
                }

                return (
                    <input
                        key={i}
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        maxLength={2}
                        value={values[i]}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        readOnly={locked}
                        className={`w-6 h-8 sm:w-8 sm:h-10 text-center bg-black ${borderColor} border ${textColor} rounded-sm font-mono text-sm sm:text-lg focus:outline-none focus:ring-1 focus:ring-[#ff007f] focus:border-[#ff007f] transition-colors`}
                        placeholder={'_'}
                        aria-label={`Character ${i + 1}`}
                        data-testid={`input-${i}`}
                    />
                );
            })}
        </span>
    );
});

CharacterInput.displayName = 'CharacterInput';
