import React from 'react';

interface EntranceStageProps {
    onAdvance: () => void;
}

export const EntranceStage: React.FC<EntranceStageProps> = ({ onAdvance }) => {
    return (
        <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold text-[#ff007f] drop-shadow-[0_0_15px_rgba(255,0,127,0.5)]">
                The Spider's Lair
            </h1>
            <p className="max-w-md mx-auto text-pink-200/80">
                Silk threads glisten in the dark. Something waits ahead...
            </p>
            <button
                onClick={onAdvance}
                className="px-8 py-3 bg-[#ff007f]/10 border border-[#ff007f]/50 hover:bg-[#ff007f]/20 hover:border-[#ff007f] text-[#ff007f] transition-all duration-300 rounded uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:shadow-[0_0_25px_rgba(255,0,127,0.5)]"
            >
                Enter the Webs
            </button>
        </div>
    );
};
