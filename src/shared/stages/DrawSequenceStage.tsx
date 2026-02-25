import React, { useState } from 'react';

export interface DrawSequenceStageProps {
    expectedDigits: string[][][]; // Array of expected digits, where each digit is an array of valid edge arrays
    onAdvance: () => void;
}

export const DrawSequenceStage: React.FC<DrawSequenceStageProps> = ({
    expectedDigits,
    onAdvance,
}) => {
    const [currentDigitIndex, setCurrentDigitIndex] = useState(0);
    const [selectedDots, setSelectedDots] = useState<number[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [flashState, setFlashState] = useState<'success' | 'error' | null>(null);

    const isAdjacent = (a: number, b: number) => {
        const xa = a % 2;
        const ya = Math.floor(a / 2);
        const xb = b % 2;
        const yb = Math.floor(b / 2);
        const dx = Math.abs(xa - xb);
        const dy = Math.abs(ya - yb);
        return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
    };

    const handlePointerDown = (index: number, e: React.PointerEvent) => {
        if (flashState) return; // Prevent drawing while flashing

        // Prevent default drag behavior on desktop (the "not allowed" ghost image)
        e.preventDefault();

        // Clear any text selection that might have occurred
        if (window.getSelection) {
            window.getSelection()?.removeAllRanges();
        }

        setIsDrawing(true);
        setSelectedDots([index]);
    };

    const handlePointerEnter = (index: number) => {
        if (isDrawing && !flashState) {
            setSelectedDots((prev) => {
                const last = prev[prev.length - 1];
                if (last !== index && isAdjacent(last, index)) {
                    return [...prev, index];
                }
                return prev;
            });
        }
    };

    const handlePointerUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (selectedDots.length < 2) {
            setSelectedDots([]);
            return;
        }

        evaluatePath();
    };

    const evaluatePath = () => {
        const edgeSet = new Set<string>();
        for (let i = 1; i < selectedDots.length; i++) {
            const a = selectedDots[i - 1];
            const b = selectedDots[i];
            const min = Math.min(a, b);
            const max = Math.max(a, b);
            edgeSet.add(`${min}-${max}`);
        }

        const drawnEdges = Array.from(edgeSet).sort();
        const validOptions = expectedDigits[currentDigitIndex];

        const isCorrect = validOptions.some(expectedOption => {
            const currentExpected = [...expectedOption].sort();
            return drawnEdges.length === currentExpected.length &&
                drawnEdges.every((edge, index) => edge === currentExpected[index]);
        });

        if (isCorrect) {
            setFlashState('success');
            setTimeout(() => {
                setFlashState(null);
                setSelectedDots([]);
                if (currentDigitIndex + 1 >= expectedDigits.length) {
                    onAdvance();
                } else {
                    setCurrentDigitIndex(prev => prev + 1);
                }
            }, 500);
        } else {
            setFlashState('error');
            setTimeout(() => {
                setFlashState(null);
                setSelectedDots([]);
            }, 400);
        }
    };

    const getDotCoordinates = (index: number) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = 40 + col * 120;
        const y = 40 + row * 120;
        return { x, y };
    };

    const getStrokeColor = () => {
        if (flashState === 'success') return '#22c55e';
        if (flashState === 'error') return '#ef4444';
        return '#3b82f6';
    };

    return (
        <div
            className="flex flex-col items-center justify-center space-y-8 w-full h-full"
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: 'none' }}
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-widest text-orange-400 uppercase">Input Sequence</h2>
                <div className="flex justify-center space-x-3">
                    {expectedDigits.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-3 h-3 rounded-full transition-colors duration-300 ${idx < currentDigitIndex
                                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'
                                : idx === currentDigitIndex
                                    ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse'
                                    : 'bg-gray-700'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="relative bg-black/40 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm" style={{ width: '200px', height: '320px' }}>
                <svg
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{ width: '100%', height: '100%' }}
                >
                    {selectedDots.map((dotIdx, i) => {
                        if (i === 0) return null;
                        const prevDotIdx = selectedDots[i - 1];
                        const start = getDotCoordinates(prevDotIdx);
                        const end = getDotCoordinates(dotIdx);
                        return (
                            <line
                                key={`line-${i}`}
                                x1={start.x}
                                y1={start.y}
                                x2={end.x}
                                y2={end.y}
                                stroke={getStrokeColor()}
                                strokeWidth="12"
                                strokeLinecap="round"
                                className="transition-colors duration-150"
                            />
                        );
                    })}
                </svg>

                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const { x, y } = getDotCoordinates(i);
                    const isSelected = selectedDots.includes(i);
                    const isLast = selectedDots[selectedDots.length - 1] === i;

                    return (
                        <div
                            key={i}
                            className={`absolute rounded-full w-12 h-12 flex items-center justify-center text-sm font-bold transition-all z-20 cursor-pointer
                                ${flashState === 'error' && isSelected ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' :
                                    flashState === 'success' && isSelected ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' :
                                        isLast ? 'bg-blue-400 ring-4 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.6)]' :
                                            isSelected ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' :
                                                'bg-gray-700/80 hover:bg-gray-600 border border-gray-600'}
                            `}
                            style={{
                                left: `${x}px`,
                                top: `${y}px`,
                                transform: 'translate(-50%, -50%)',
                                touchAction: 'none'
                            }}
                            onPointerDown={(e) => {
                                e.currentTarget.releasePointerCapture(e.pointerId);
                                handlePointerDown(i, e);
                            }}
                            onPointerEnter={() => handlePointerEnter(i)}
                        >
                            <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-400'}`} />
                        </div>
                    );
                })}
            </div>

            <button
                className="px-6 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 opacity-60 hover:opacity-100"
                onClick={() => setSelectedDots([])}
                disabled={!!flashState || selectedDots.length === 0}
            >
                Clear Line
            </button>
        </div>
    );
};
