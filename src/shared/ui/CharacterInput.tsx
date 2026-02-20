import React, { useState, useRef, useEffect } from 'react';

interface CharacterInputProps {
    expectedValue: string;
    onComplete: () => void;
    showGuide?: boolean;
}

/**
 * Hangman-style character input.
 * Static characters (spaces, punctuation) are rendered as <span> elements
 * and are skipped by the focus algorithm.
 */
export const CharacterInput: React.FC<CharacterInputProps> = ({
    expectedValue,
    onComplete,
    showGuide = true,
}) => {
    const chars = expectedValue.split('');
    const [values, setValues] = useState<string[]>(() => chars.map(() => ''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Characters that should be static (not editable)
    const isStatic = (ch: string) => /[^a-zA-Z0-9]/.test(ch);

    // Pre-fill static chars
    useEffect(() => {
        setValues(chars.map(ch => (isStatic(ch) ? ch : '')));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expectedValue]);

    // Check completion whenever values change
    useEffect(() => {
        const joined = values.join('').toLowerCase();
        if (joined === expectedValue.toLowerCase() && joined.length > 0) {
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
        if (isStatic(chars[index])) return;

        const char = value.slice(-1); // take the last typed char
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
        if (e.key === 'Backspace') {
            if (!values[index]) {
                // Current box empty → move to previous input
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

    return (
        <div className="flex flex-wrap justify-center gap-1" role="group">
            {chars.map((ch, i) => {
                if (isStatic(ch)) {
                    return (
                        <span
                            key={i}
                            className="w-8 h-10 flex items-center justify-center text-[#ff007f]/60 text-lg font-mono"
                            data-testid={`static-${i}`}
                        >
                            {ch === ' ' ? '\u00A0' : ch}
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
                        className="w-8 h-10 text-center bg-black border border-pink-500 text-pink-200 rounded-sm font-mono text-lg focus:outline-none focus:ring-1 focus:ring-[#ff007f] focus:border-[#ff007f] transition-colors"
                        placeholder={showGuide ? '_' : ''}
                        aria-label={`Character ${i + 1}`}
                        data-testid={`input-${i}`}
                    />
                );
            })}
        </div>
    );
};
