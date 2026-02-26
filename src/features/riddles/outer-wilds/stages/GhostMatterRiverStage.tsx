import React, { useState, useRef } from 'react';

interface GhostMatterRiverStageProps {
    onAdvance: () => void;
}

const GRID_ROWS = 10;
const GRID_COLS = 5;

// 0: Hazard (Ghost Matter)
// 1: Safe (Water/River)
// 2: Start
// 3: Goal
const MAZE_LAYOUT = [
    [0, 0, 2, 0, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 3],
];

export const GhostMatterRiverStage: React.FC<GhostMatterRiverStageProps> = ({ onAdvance }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [flashState, setFlashState] = useState<'none' | 'fail' | 'success'>('none');
    const containerRef = useRef<HTMLDivElement>(null);

    const handleFail = () => {
        setIsPlaying(false);
        setFlashState('fail');
        setTimeout(() => setFlashState('none'), 300);
    };

    const handleSuccess = () => {
        setIsPlaying(false);
        setFlashState('success');
        setTimeout(() => {
            onAdvance();
        }, 500); // Brief delay to show success color before advancing
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        const type = target.getAttribute('data-type');

        if (type === 'start') {
            setIsPlaying(true);
            setFlashState('none');
            // Explicitly capture the pointer so we get move events even if they drag fast
            target.setPointerCapture(e.pointerId);
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

        if (type === 'hazard') {
            handleFail();
        } else if (type === 'goal') {
            handleSuccess();
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isPlaying) return;

        const target = e.target as HTMLElement;
        if (target.hasPointerCapture(e.pointerId)) {
            target.releasePointerCapture(e.pointerId);
        }

        setIsPlaying(false);
        // Lifting pointer before goal means resetting
        handleFail();
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-sm px-4 select-none touch-none">
            <h2 className="text-2xl font-bold text-orange-400">The Ghost Matter River</h2>
            <p className="text-gray-300 text-center">
                Trace the water stream.<br />
                <span className="text-emerald-400 font-bold">Do not touch the ghost matter.</span><br />
                Do not lift your finger until you reach the end.
            </p>

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
                    aspectRatio: '1 / 2', // make it tall and portrait
                    touchAction: 'none' // Critical for mobile dragging
                }}
            >
                {MAZE_LAYOUT.map((row, rowIndex) =>
                    row.map((cellObj, colIndex) => {
                        let type = 'hazard';
                        let bgClass = 'bg-slate-800/80 m-[1px] rounded-sm'; // Default hazard

                        if (cellObj === 1) {
                            type = 'safe';
                            bgClass = isPlaying ? 'bg-cyan-600' : 'bg-cyan-800';
                        } else if (cellObj === 2) {
                            type = 'start';
                            bgClass = isPlaying ? 'bg-orange-500' : 'bg-orange-600 border border-orange-400 animate-pulse';
                        } else if (cellObj === 3) {
                            type = 'goal';
                            bgClass = 'bg-emerald-600 border border-emerald-400';
                        } else {
                            // Hazard styling
                            // If we want it to look like ghost matter, maybe some green tint
                            bgClass = 'bg-[#1a2e25] border border-[#16291f] border-opacity-30';
                        }

                        // We only attach pointer events to the 'start' tile initially, 
                        // and once captured, that element receives all move/up events.
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                data-type={type}
                                className={`${bgClass} transition-colors duration-150 relative`}
                                onPointerDown={type === 'start' ? handlePointerDown : undefined}
                                onPointerMove={type === 'start' ? handlePointerMove : undefined}
                                onPointerUp={type === 'start' ? handlePointerUp : undefined}
                                onPointerCancel={type === 'start' ? handlePointerUp : undefined}
                            >
                                {cellObj === 2 && !isPlaying && (
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold pointer-events-none text-white shadow-black drop-shadow-md">START</span>
                                )}
                                {cellObj === 3 && (
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold pointer-events-none text-white shadow-black drop-shadow-md">END</span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
