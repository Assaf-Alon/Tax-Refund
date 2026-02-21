import React, { useState } from 'react';
import { HintButton } from '../../../../shared/ui/HintButton';
import { isCloseEnough } from '../../../../shared/logic/fuzzyMatch';

interface TextAnswerStageProps {
    title: string;
    prompt: string | React.ReactNode;
    acceptedAnswers: string[];
    hint?: string;
    hintCooldown?: number;
    errorMessage?: string;
    onAdvance: () => void;
    image?: string;
    imageAlt?: string;
}

export const TextAnswerStage: React.FC<TextAnswerStageProps> = ({
    title,
    prompt,
    acceptedAnswers,
    hint,
    hintCooldown = 60,
    errorMessage = 'The web rejects your answer...',
    onAdvance,
    image,
    imageAlt,
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
        <div className="text-center space-y-8 w-full max-w-lg">
            <h2 className="text-2xl text-[#ff007f]">{title}</h2>

            {image && (
                <div className="flex justify-center">
                    <img
                        src={image}
                        alt={imageAlt ?? ''}
                        className="max-w-xs rounded-lg border border-[#b0005d] shadow-[0_0_20px_rgba(255,0,127,0.3)]"
                    />
                </div>
            )}

            {typeof prompt === 'string' ? (
                <p className="text-pink-200/60 text-sm">{prompt}</p>
            ) : (
                prompt
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full max-w-xs bg-black/50 border border-[#b0005d] p-3 text-center text-pink-100 focus:border-[#ff007f] focus:outline-none focus:ring-1 focus:ring-[#ff007f] transition-colors rounded"
                    placeholder="Answer..."
                    autoFocus
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-[#ff007f]/10 border border-[#b0005d] hover:bg-[#ff007f]/20 hover:border-[#ff007f] transition-all duration-200 text-xs uppercase tracking-wider text-pink-200 rounded"
                >
                    Answer
                </button>
            </form>

            {error && (
                <p className="text-red-400 text-sm animate-pulse">{error}</p>
            )}

            {hint && (
                <HintButton hint={hint} cooldownSeconds={hintCooldown} />
            )}
        </div>
    );
};
