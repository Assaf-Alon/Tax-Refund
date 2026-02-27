import React, { useState, useRef } from 'react';

import esquieImg from '../assets/Esquie.gif';

interface Particle {
    id: number;
    x: number;
    y: number;
    type: 'heart' | 'text';
}

export interface EsquieStageProps {
    onAdvance: () => void;
}

export const EsquieStage: React.FC<EsquieStageProps> = ({ onAdvance }) => {
    const [pets, setPets] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]);
    const particleIdCounter = useRef(0);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (pets >= 33) return;

        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate click position relative to the image center or just the click event
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newPetCount = pets + 1;
        setPets(newPetCount);

        const id = particleIdCounter.current++;
        const newParticle: Particle = {
            id,
            x,
            y,
            type: Math.random() > 0.5 ? 'heart' : 'text'
        };

        setParticles(prev => [...prev, newParticle]);

        // Remove particle after 1s (matching animation duration)
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, 1000);

        if (newPetCount === 33) {
            // Add a small delay so the player can see the final particle
            setTimeout(() => {
                onAdvance();
            }, 800);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <style>
                {`
                    @keyframes floatUpFade {
                        0% { opacity: 1; transform: translateY(0) scale(1); }
                        100% { opacity: 0; transform: translateY(-60px) scale(1.5); }
                    }
                    .particle-anim {
                        animation: floatUpFade 1s ease-out forwards;
                    }
                `}
            </style>

            <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md mx-auto relative px-4 text-center">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Esquie's Rest</h2>
                    <p className="text-gray-300">
                        Esquie is sleeping peacefully. We must wake him up with exactly 33 pets.
                    </p>
                </div>

                <div
                    className="relative cursor-pointer transition-transform active:scale-95 duration-75 select-none"
                    onClick={handleClick}
                >
                    <img
                        src={esquieImg}
                        alt="Esquie"
                        className={`w-64 h-64 object-cover rounded-2xl border-4 transition-all duration-500 ${pets >= 30 ? 'border-emerald-300 shadow-[0_0_50px_rgba(52,211,153,0.8)]' :
                                pets >= 20 ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.5)]' :
                                    pets >= 10 ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(52,211,153,0.3)]' :
                                        'border-slate-700/50 shadow-2xl'
                            }`}
                        draggable={false}
                    />

                    {/* Particles layer relative to the image */}
                    <div className="absolute inset-0 overflow-visible pointer-events-none">
                        {particles.map(p => (
                            <div
                                key={p.id}
                                className="particle-anim absolute transform -translate-x-1/2 -translate-y-1/2 font-bold z-10 drop-shadow-md text-xl"
                                style={{ left: p.x, top: p.y }}
                            >
                                {p.type === 'heart' ? '❤️' : <span className="text-emerald-300">Whee!</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`mt-8 text-2xl font-mono px-6 py-3 rounded-xl border transition-all duration-500 ${pets >= 30 ? 'bg-emerald-900/40 border-emerald-300 text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.6)]' :
                        pets >= 20 ? 'bg-black/60 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]' :
                            pets >= 10 ? 'bg-black/50 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]' :
                                'bg-black/40 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.05)]'
                    }`}>
                    {pets} <span className={pets >= 20 ? "text-emerald-500" : "text-emerald-700"}>/</span> 33
                </div>
            </div>
        </div>
    );
};
