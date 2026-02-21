import React, { useState } from 'react';
import { HintButton } from '../ui/HintButton';
import { isCloseEnough } from '../logic/fuzzyMatch';
import type { TextAnswerTheme } from './types';

export interface TextAnswerStageProps {
    title: string;
    prompt: string | React.ReactNode;
    acceptedAnswers: string[];
    hint?: string;
    hintCooldown?: number;
    errorMessage?: string;
    onAdvance: () => void;
    image?: string;
    imageAlt?: string;
    placeholder?: string;
    submitButtonLabel?: string;
    theme?: TextAnswerTheme;
}

export const TextAnswerStage: React.FC<TextAnswerStageProps> = ({
    title,
    prompt,
    acceptedAnswers,
    hint,
    hintCooldown = 60,
    errorMessage = 'Wrong answer. Try again.',
    onAdvance,
    image,
    imageAlt,
    placeholder = 'Answer...',
    submitButtonLabel = 'Answer',
    theme,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCloseEnough(inputValue, acceptedAnswers)) {
            onAdvance();
        } else {
            setError(errorMessage);
            setInputValue('');
        }
    };

    return (
        <div className={theme?.container ?? 'text-center space-y-8 w-full max-w-lg'}>
            <h2 className={theme?.title ?? 'text-2xl font-bold'}>{title}</h2>

            {image && (
                <div className="flex justify-center">
                    <img
                        src={image}
                        alt={imageAlt ?? ''}
                        className={theme?.imageWrapper ?? 'max-w-xs rounded-lg border border-gray-600'}
                    />
                </div>
            )}

            {typeof prompt === 'string' ? (
                <p className={theme?.promptText ?? 'text-sm opacity-60'}>{prompt}</p>
            ) : (
                prompt
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={theme?.input ?? 'w-full max-w-xs bg-black/50 border border-gray-600 p-3 text-center focus:outline-none focus:ring-1 transition-colors rounded'}
                    placeholder={placeholder}
                    autoFocus
                />
                <button
                    type="submit"
                    className={theme?.submitButton ?? 'px-6 py-2 border border-gray-600 hover:bg-gray-800 transition-all duration-200 text-xs uppercase tracking-wider rounded'}
                >
                    {submitButtonLabel}
                </button>
            </form>

            {error && (
                <p className={theme?.errorText ?? 'text-red-400 text-sm animate-pulse'}>{error}</p>
            )}

            {hint && (
                <HintButton hint={hint} cooldownSeconds={hintCooldown} />
            )}
        </div>
    );
};
