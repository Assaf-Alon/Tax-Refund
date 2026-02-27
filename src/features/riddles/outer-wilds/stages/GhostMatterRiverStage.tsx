import React, { useState, useRef, useEffect } from 'react';

interface GhostMatterRiverStageProps {
    onAdvance: () => void;
}

const GRID_ROWS = 6;
const GRID_COLS = 5;

// 0: Hazard (Ghost Matter)
// 1: Safe (Water/River)
// 2: Start
// 3: Goal
const MAZE_LAYOUT = [
    [0, 0, 2, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 3, 0],
];

export const GhostMatterRiverStage: React.FC<GhostMatterRiverStageProps> = ({ onAdvance }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [flashState, setFlashState] = useState<'none' | 'fail' | 'success'>('none');
    const [isScoutActive, setIsScoutActive] = useState(false);
    const [trail, setTrail] = useState<Set<string>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);
    const scoutTimerRef = useRef<number | null>(null);
    const captureRef = useRef<{ id: number; element: HTMLElement } | null>(null);

    useEffect(() => {
        return () => {
            if (scoutTimerRef.current !== null) {
                window.clearTimeout(scoutTimerRef.current);
            }
            if (captureRef.current) {
                try {
                    captureRef.current.element.releasePointerCapture(captureRef.current.id);
                } catch (e) {
                    // Ignore error on unmount
                }
            }
        };
    }, []);

    const handleFail = () => {
        setIsPlaying(false);
        setFlashState('fail');
        setTrail(new Set());
        setTimeout(() => setFlashState('none'), 300);
    };

    const handleSuccess = () => {
        setIsPlaying(false);
        setFlashState('success');
        setTrail(new Set());
        setTimeout(() => {
            window.scrollTo(0, 0); // Reset scroll position to prevent gaps at top
            onAdvance();
        }, 500); // Brief delay to show success color before advancing
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isScoutActive) return; // Prevent starting while scout is active

        const target = e.target as HTMLElement;
        const type = target.getAttribute('data-type');
        const coords = target.getAttribute('data-coords');

        if (type === 'start') {
            setIsPlaying(true);
            setFlashState('none');
            setTrail(new Set(coords ? [coords] : []));
            // Explicitly capture the pointer so we get move events even if they drag fast
            target.setPointerCapture(e.pointerId);
            captureRef.current = { id: e.pointerId, element: target };
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isPlaying) return;

        // Prevent default scrolling on mobile while dragging
        e.preventDefault();

        const x = e.clientX;
        const y = e.clientY;

        const elementUnderPointer = document.elementFromPoint(x, y);
        if (!elementUnderPointer || !containerRef.current?.contains(elementUnderPointer)) {
            // Dragged out of the game area entirely
            handleFail();
            return;
        }

        const type = elementUnderPointer.getAttribute('data-type');
        const coords = elementUnderPointer.getAttribute('data-coords');

        if (coords) {
            setTrail(prev => {
                if (prev.has(coords)) return prev;
                const newSet = new Set(prev);
                newSet.add(coords);
                return newSet;
            });
        }

        if (type === 'hazard') {
            handleFail();
        } else if (type === 'goal') {
            handleSuccess();
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.hasPointerCapture && target.hasPointerCapture(e.pointerId)) {
            target.releasePointerCapture(e.pointerId);
        }
        captureRef.current = null;

        if (!isPlaying) return;

        setIsPlaying(false);
        // Lifting pointer before goal means resetting
        handleFail();
    };

    const launchScout = () => {
        if (isPlaying || isScoutActive) return;

        setIsScoutActive(true);
        if (scoutTimerRef.current !== null) {
            window.clearTimeout(scoutTimerRef.current);
        }
        scoutTimerRef.current = window.setTimeout(() => {
            setIsScoutActive(false);
            scoutTimerRef.current = null;
        }, 2500);
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-sm px-4 select-none touch-none overscroll-none">
            <h2 className="text-2xl font-bold text-orange-400 text-center">The Ghost Matter River</h2>

            <div className="text-center space-y-3">
                <p className="text-gray-300 text-sm">
                    The path is invisible.<br />
                    Launch your scout to spot the ghost matter.<br />
                    <span className="text-emerald-400 font-bold">Do not touch the ghost matter.</span><br />
                    Do not lift your finger.
                </p>

                <button
                    onClick={launchScout}
                    disabled={isPlaying || isScoutActive}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors border border-slate-500 hover:border-slate-400 active:scale-95 shadow-md"
                >
                    {isScoutActive ? 'Scout Active...' : 'Launch Scout'}
                </button>
            </div>

            <div
                ref={containerRef}
                className={`relative bg-slate-900 border-4 rounded-xl overflow-hidden transition-colors duration-150 ${flashState === 'fail' ? 'border-red-500 bg-red-950/50' :
                    flashState === 'success' ? 'border-emerald-500 bg-emerald-950/50' :
                        'border-slate-700'
                    }`}
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
                    width: '100%',
                    aspectRatio: '5 / 6', // make it proportional to grid (5 cols, 6 rows)
                    touchAction: 'none' // Critical for mobile dragging
                }}
            >
                {MAZE_LAYOUT.map((row, rowIndex) =>
                    row.map((cellObj, colIndex) => {
                        const coords = `${rowIndex}-${colIndex}`;
                        let type = 'hazard';
                        const isTrailed = trail.has(coords);

                        // Default murky grid look
                        let bgClass = 'bg-slate-800/90 border-slate-700/50';

                        if (cellObj === 1) {
                            type = 'safe';
                        } else if (cellObj === 2) {
                            type = 'start';
                            bgClass = isPlaying ? 'bg-orange-500 border-orange-400' : 'bg-orange-600 border-orange-400 animate-pulse';
                        } else if (cellObj === 3) {
                            type = 'goal';
                            bgClass = 'bg-emerald-600 border-emerald-400';
                        }

                        // Scout / Trail logic overrides
                        if (type === 'hazard' && isScoutActive) {
                            bgClass = 'bg-emerald-500/80 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10';
                        } else if (isTrailed) {
                            if (type === 'safe' || type === 'start') {
                                bgClass = 'bg-cyan-500/80 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)] z-10 transition-colors duration-200';
                            } else if (type === 'hazard') {
                                bgClass = 'bg-red-500/80 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)] z-10';
                            }
                        }

                        // We only attach pointer events to the 'start' tile initially, 
                        // and once captured, that element receives all move/up events.
                        return (
                            <div
                                key={coords}
                                data-type={type}
                                data-coords={coords}
                                className={`${bgClass} border m-[1px] rounded-sm transition-colors duration-150 relative`}
                                onPointerDown={type === 'start' ? handlePointerDown : undefined}
                                onPointerMove={type === 'start' ? handlePointerMove : undefined}
                                onPointerUp={type === 'start' ? handlePointerUp : undefined}
                                onPointerCancel={type === 'start' ? handlePointerUp : undefined}
                            >
                                {cellObj === 2 && !isPlaying && (
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold pointer-events-none text-white shadow-black drop-shadow-md">START</span>
                                )}
                                {cellObj === 3 && (
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold pointer-events-none text-white shadow-black drop-shadow-md">END</span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
