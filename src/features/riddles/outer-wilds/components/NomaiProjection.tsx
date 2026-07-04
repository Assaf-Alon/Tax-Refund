import React, { useState, useEffect, useRef } from 'react';

export const NomaiProjection: React.FC = () => {
    const [isActivated, setIsActivated] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const typewriterRef = useRef<number | null>(null);

    const fullMessage = "LORE COMPLETED: WE HAVE DETECTED A STABLE SIGNAL NEAR 🇫🇷.";

    const handleActivate = () => {
        setIsActivated(true);
    };

    const handleTranslate = () => {
        if (isTranslating) return;
        setIsTranslating(true);
        setTranslatedText('');

        let i = 0;
        if (typewriterRef.current) {
            clearInterval(typewriterRef.current);
        }

        typewriterRef.current = window.setInterval(() => {
            if (i < fullMessage.length) {
                // Read next character, accounting for surrogate pairs or emojis
                const nextChar = fullMessage.codePointAt(i);
                if (nextChar !== undefined) {
                    const charStr = String.fromCodePoint(nextChar);
                    setTranslatedText(prev => prev + charStr);
                    i += charStr.length;
                } else {
                    i++;
                }
            } else {
                if (typewriterRef.current) {
                    clearInterval(typewriterRef.current);
                }
            }
        }, 50);
    };

    useEffect(() => {
        return () => {
            if (typewriterRef.current) {
                clearInterval(typewriterRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-xl mx-auto my-6 p-6 rounded-2xl bg-slate-950/40 border border-sky-950/50 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-radial-glow pointer-events-none opacity-20 transition-opacity duration-1000" />

            {!isActivated ? (
                <div className="flex flex-col items-center space-y-6 z-10 py-6">
                    {/* Empty Slot Graphic */}
                    <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-4 border-dashed border-sky-900/50 bg-sky-950/10 animate-pulse">
                        <div className="w-24 h-24 rounded-full border-2 border-sky-800/30 flex items-center justify-center">
                            <span className="text-sky-500/40 text-4xl">⏛</span>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-mono font-bold tracking-wider text-sky-400">PROJECTION PEDESTAL</h3>
                        <p className="text-sm text-sky-200/50 max-w-xs font-mono">Insert Nomai projection stone to establish connection.</p>
                    </div>

                    <button
                        onClick={handleActivate}
                        className="px-6 py-3 bg-sky-900/30 hover:bg-sky-500/20 text-sky-300 hover:text-sky-100 border border-sky-500/50 rounded-lg font-mono tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.1)] hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] uppercase text-xs cursor-pointer"
                    >
                        Insert Projection Stone
                    </button>
                </div>
            ) : (
                <div className="w-full flex flex-col items-center space-y-6 z-10">
                    <h3 className="text-sm font-mono tracking-widest text-sky-400 animate-pulse uppercase">
                        Connection Active &bull; Projection Pool Loaded
                    </h3>

                    {/* Nomai Holographic Spiral Script */}
                    <div className="relative w-72 h-72 flex items-center justify-center bg-black/30 rounded-full border border-sky-500/20 shadow-[inset_0_0_30px_rgba(14,165,233,0.1)]">
                        {/* Rotating Outer Ring */}
                        <div className="absolute inset-2 border border-sky-400/20 rounded-full border-t-transparent border-b-transparent animate-[spin_40s_linear_infinite]" />
                        <div className="absolute inset-6 border border-dashed border-sky-500/10 rounded-full animate-[spin_25s_linear_infinite_reverse]" />

                        <svg
                            viewBox="0 0 300 300"
                            className="w-64 h-64 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                        >
                            {/* Curved, glowing branching Nomai lines */}
                            <path
                                d="M 150 150 Q 155 110 190 110 Q 230 110 230 150 Q 230 200 180 220 Q 120 240 100 170 Q 80 100 150 70 Q 230 35 250 120"
                                fill="none"
                                stroke="#22d3ee"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="animate-[draw-spiral_3s_ease-out_forwards]"
                                style={{
                                    strokeDasharray: 1000,
                                    strokeDashoffset: 1000,
                                }}
                            />
                        </svg>

                        {/* Add custom CSS to inject path animation */}
                        <style>{`
                            @keyframes draw-spiral {
                                to {
                                    stroke-dashoffset: 0;
                                }
                            }
                        `}</style>
                    </div>

                    {!isTranslating && (
                        <button
                            onClick={handleTranslate}
                            className="px-6 py-2.5 bg-cyan-950/40 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/50 rounded font-mono tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] text-xs cursor-pointer uppercase"
                        >
                            Translate Nomai Script
                        </button>
                    )}

                    {isTranslating && (
                        <div className="w-full mt-4 p-4 border border-cyan-500/40 bg-black/60 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.1)] relative">
                            {/* Scanning laser line overlay */}
                            <div className="absolute inset-x-0 h-[2px] bg-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.8)] top-0 animate-[scan_2s_linear_infinite]" />

                            <div className="font-mono text-cyan-200 text-left text-xs tracking-wider leading-relaxed min-h-[40px] uppercase break-words selection:bg-cyan-500/30">
                                {(() => {
                                    const flagEmoji = "🇫🇷";
                                    let cleanText = translatedText;
                                    let showFlag = false;

                                    if (cleanText.includes(flagEmoji)) {
                                        showFlag = true;
                                        cleanText = cleanText.replace(flagEmoji, "");
                                    } else if (cleanText.includes("\uD83C\uDDEB") || cleanText.includes("\uD83C\uDDF7")) {
                                        cleanText = cleanText.replace(/\uD83C[\uDDEB\uDDF7]/g, "");
                                        showFlag = true;
                                    }

                                    if (showFlag) {
                                        const index = cleanText.indexOf("NEAR ");
                                        if (index !== -1) {
                                            const before = cleanText.substring(0, index + 5);
                                            const after = cleanText.substring(index + 5);
                                            return (
                                                <>
                                                    {before}
                                                    <span className="inline-flex h-3 w-4 border border-cyan-500/30 overflow-hidden mx-1.5 align-middle select-none">
                                                        <span className="w-1/3 h-full bg-[#0055A5]" />
                                                        <span className="w-1/3 h-full bg-[#FFFFFF]" />
                                                        <span className="w-1/3 h-full bg-[#EF4135]" />
                                                    </span>
                                                    {after}
                                                </>
                                            );
                                        }
                                    }

                                    return <>{cleanText}</>;
                                })()}
                                {translatedText.length < fullMessage.length && (
                                    <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse" />
                                )}
                            </div>


                            <style>{`
                                @keyframes scan {
                                    0% { top: 0%; opacity: 0; }
                                    10% { opacity: 1; }
                                    90% { opacity: 1; }
                                    100% { top: 100%; opacity: 0; }
                                }
                            `}</style>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
