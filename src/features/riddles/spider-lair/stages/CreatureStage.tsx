import React, { useState } from 'react';
import { HintButton } from '../../../../shared/ui/HintButton';
import clawmaidenImg from '../assets/Clawmaiden.png';

interface CreatureStageProps {
    onAdvance: () => void;
}

const ACCEPTED_ANSWERS = ['silk monster', 'clawmaiden'];

export const CreatureStage: React.FC<CreatureStageProps> = ({ onAdvance }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ACCEPTED_ANSWERS.includes(inputValue.toLowerCase().trim())) {
            onAdvance();
        } else {
            setError('The creature stares at you, unimpressed...');
            setInputValue('');
        }
    };

    return (
        <div className="text-center space-y-8 w-full max-w-lg">
            <h2 className="text-2xl text-[#ff007f]">What Creature Is This?</h2>

            <div className="flex justify-center">
                <img
                    src={clawmaidenImg}
                    alt="A mysterious creature"
                    className="max-w-xs rounded-lg border border-[#b0005d] shadow-[0_0_20px_rgba(255,0,127,0.3)]"
                />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full max-w-xs bg-black/50 border border-[#b0005d] p-3 text-center text-pink-100 focus:border-[#ff007f] focus:outline-none focus:ring-1 focus:ring-[#ff007f] transition-colors rounded"
                    placeholder="Name this creature..."
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

            <HintButton hint="Woven from silk, born to destroy..." cooldownSeconds={60} />
        </div>
    );
};
