import React, { useState, useEffect } from 'react';
import { getRiddleProgress, updateRiddleProgress } from '../../shared/logic/gameState';

const RIDDLE_ID = 'the-cave';

export const TheCave: React.FC = () => {
    const [stage, setStage] = useState<number>(0);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    // Load initial state
    useEffect(() => {
        const savedStage = getRiddleProgress(RIDDLE_ID);
        setStage(savedStage);
    }, []);

    // Save state on change
    const advanceStage = (newStage: number) => {
        setStage(newStage);
        updateRiddleProgress(RIDDLE_ID, newStage);
        setError('');
        setInputValue('');
    };

    const handleEntrance = () => {
        advanceStage(1);
    };

    const handleRiddleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.toLowerCase().trim() === 'crawl') {
            advanceStage(2);
        } else {
            setError('The path is blocked. Try something else.');
            setInputValue('');
        }
    };

    const handleExit = () => {
        advanceStage(3);
    };

    // Render based on stage
    if (stage === 0) {
        return (
            <div className="text-center space-y-8">
                <h1 className="text-4xl font-bold text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">The Cave Entrance</h1>
                <p className="max-w-md mx-auto">You stand before a gaping maw in the earth. A cold draft chills your bones.</p>
                <button
                    onClick={handleEntrance}
                    className="px-8 py-3 bg-green-900/30 border border-green-500/50 hover:bg-green-500/20 hover:border-green-400 text-green-300 transition-all duration-300 rounded uppercase tracking-widest text-sm"
                >
                    Enter the Darkness
                </button>
            </div>
        );
    }

    if (stage === 1) {
        return (
            <div className="text-center space-y-8 w-full max-w-lg">
                <h2 className="text-2xl text-green-400">The Narrow Passage</h2>
                <p>The ceiling lowers. You cannot walk upright. What must you do?</p>

                <form onSubmit={handleRiddleSubmit} className="flex flex-col gap-4 items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full max-w-xs bg-black/50 border border-green-800 p-2 text-center text-green-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                        placeholder="Action..."
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-900/20 border border-green-800 hover:bg-green-800/40 transition-colors text-xs uppercase tracking-wider"
                    >
                        Attempt
                    </button>
                </form>

                {error && (
                    <p className="text-red-400 text-sm animate-pulse">{error}</p>
                )}
            </div>
        );
    }

    if (stage === 2) {
        return (
            <div className="text-center space-y-8">
                <h2 className="text-2xl text-green-400">The Light</h2>
                <p>You have made it through the crawlspace. You see light ahead.</p>
                <button
                    onClick={handleExit}
                    className="px-8 py-3 bg-green-900/30 border border-green-500/50 hover:bg-green-500/20 hover:border-green-400 text-green-300 transition-all duration-300 rounded uppercase tracking-widest text-sm"
                >
                    Leave the Cave
                </button>
            </div>
        );
    }

    return (
        <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]">CONGRATULATIONS</h1>
            <p className="text-xl opacity-80">You have completed the pilot module.</p>
            <div className="p-4 border border-green-900/50 bg-black/40 inline-block font-mono text-xs">
                System Status: OPERATIONAL
            </div>
        </div>
    );
};
