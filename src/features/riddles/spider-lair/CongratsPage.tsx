import React from 'react';
import carrefourImg from './assets/Carrefour.png';
import gitGudGif from './assets/git-gud.gif';

export const CongratsPage: React.FC = () => {
    return (
        <div className="text-center space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#ff007f] drop-shadow-[0_0_15px_rgba(255,0,127,0.8)]">
                CONGRATULATIONS
            </h1>
            <p className="text-xl text-pink-200/80">
                You have escaped the Spider's Lair.
            </p>

            <div className="flex flex-col items-center gap-6">
                <img
                    src={carrefourImg}
                    alt="Carrefour"
                    className="max-w-xs rounded-lg border border-[#b0005d] shadow-[0_0_20px_rgba(255,0,127,0.3)]"
                />
                <img
                    src={gitGudGif}
                    alt="Git Gud"
                    className="max-w-xs rounded-lg"
                />
            </div>

            <div className="p-4 border border-[#ff007f]/30 bg-black/40 inline-block font-mono text-xs text-[#ff007f]/70">
                Web Status: CLEARED
            </div>
        </div>
    );
};
