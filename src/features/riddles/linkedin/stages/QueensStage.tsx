import React, { useState, useEffect, useMemo } from 'react';
import { Crown, Heart, RotateCcw, X, Info } from 'lucide-react';

interface QueensStageProps {
    onAdvance: () => void;
}

const GRID_MAP = [
  [1, 1, 1, 1, 2, 2, 2, 2, 3],
  [1, 1, 9, 9, 2, 9, 9, 3, 3],
  [1, 9, 9, 9, 9, 9, 9, 9, 3],
  [8, 9, 9, 9, 9, 9, 9, 9, 3],
  [8, 8, 9, 9, 9, 9, 9, 4, 4],
  [7, 8, 7, 9, 9, 9, 5, 5, 4],
  [7, 7, 7, 6, 9, 5, 5, 5, 4],
  [6, 6, 6, 6, 5, 5, 4, 4, 4],
  [6, 6, 6, 5, 5, 5, 5, 5, 4]
];

const SIZE = 9;

const REGION_COLORS: Record<number, string> = {
  1: 'bg-[#6366f1]', 2: 'bg-[#0ea5e9]', 3: 'bg-[#10b981]',
  4: 'bg-[#84cc16]', 5: 'bg-[#eab308]', 6: 'bg-[#f97316]',
  7: 'bg-[#ef4444]', 8: 'bg-[#a855f7]', 9: 'bg-[#be123c]',
};

const BORDER_COLORS: Record<number, string> = {
  1: 'border-[#4f46e5]', 2: 'border-[#0284c7]', 3: 'border-[#059669]',
  4: 'border-[#65a30d]', 5: 'border-[#ca8a04]', 6: 'border-[#ea580c]',
  7: 'border-[#dc2626]', 8: 'border-[#9333ea]', 9: 'border-[#881337]',
};

const STARTING_QUEENS: Position[] = [{ r: 4, c: 7 }];

interface Position {
    r: number;
    c: number;
}

export const QueensStage: React.FC<QueensStageProps> = ({ onAdvance }) => {
    const [queens, setQueens] = useState<Position[]>(STARTING_QUEENS);
    const [manualMarks, setManualMarks] = useState<Position[]>([]);
    const [solved, setSolved] = useState(false);
    const [showRules, setShowRules] = useState(false);

    const autoMarks = useMemo(() => {
        const marks = Array(SIZE).fill(0).map(() => Array(SIZE).fill(false));
        queens.forEach(q => {
            const regionId = GRID_MAP[q.r][q.c];
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (queens.some(other => other.r === r && other.c === c)) continue;
                    if (r === q.r || c === q.c || GRID_MAP[r][c] === regionId || (Math.abs(r - q.r) <= 1 && Math.abs(c - q.c) <= 1)) {
                        marks[r][c] = true;
                    }
                }
            }
        });
        return marks;
    }, [queens]);

    const errors = useMemo(() => {
        const errorCells: Position[] = [];
        queens.forEach((q, i) => {
            const others = queens.filter((_, idx) => idx !== i);
            const region = GRID_MAP[q.r][q.c];
            const hasConflict = others.some(o => 
                o.r === q.r || o.c === q.c || GRID_MAP[o.r][o.c] === region || (Math.abs(o.r - q.r) <= 1 && Math.abs(o.c - q.c) <= 1)
            );
            if (hasConflict) errorCells.push({ r: q.r, c: q.c });
        });
        return errorCells;
    }, [queens]);

    const toggleCell = (r: number, c: number) => {
        if (solved) return;
        
        const queenIndex = queens.findIndex(q => q.r === r && q.c === c);
        const markIndex = manualMarks.findIndex(m => m.r === r && m.c === c);
        const isStarting = STARTING_QUEENS.some(q => q.r === r && q.c === c);

        if (queenIndex > -1) {
            if (isStarting) return;
            setQueens(queens.filter((_, i) => i !== queenIndex));
            setManualMarks([...manualMarks, { r, c }]);
        } else if (markIndex > -1) {
            setManualMarks(manualMarks.filter((_, i) => i !== markIndex));
        } else {
            if (queens.length < SIZE) {
                setQueens([...queens, { r, c }]);
            }
        }
    };

    useEffect(() => {
        if (queens.length === SIZE && errors.length === 0) {
            setSolved(true);
        }
    }, [queens, errors]);

    useEffect(() => {
        if (solved) {
            const timer = setTimeout(() => {
                onAdvance();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [solved, onAdvance]);

    const resetGame = () => {
        setQueens(STARTING_QUEENS);
        setManualMarks([]);
        setSolved(false);
    };

    return (
        <div className="flex flex-col items-center w-full font-sans p-4 animate-in fade-in duration-700">
            <div className="w-full max-w-md bg-white dark:bg-[#1b1f23] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col items-center">
                
                <div className="w-full bg-white dark:bg-[#282f36] border-b border-gray-200 dark:border-gray-700 h-14 flex items-center justify-between px-4 relative">
                    <button 
                        type="button"
                        onClick={() => setShowRules(true)}
                        className="text-gray-400 hover:text-[#0a66c2] transition-colors p-1"
                        title="Game Rules"
                    >
                        <Info size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="bg-[#0a66c2] p-1 rounded text-white font-bold text-lg leading-none">Q</div>
                        <span className="font-semibold text-sm dark:text-gray-200">Queens</span>
                    </div>

                    <button 
                        type="button"
                        onClick={resetGame} 
                        className="text-gray-400 hover:text-[#0a66c2] dark:text-gray-400 dark:hover:text-[#378fe9] flex flex-col items-center text-[10px] active:scale-95 transition-all"
                    >
                        <RotateCcw size={18} />
                        <span className="mt-0.5 font-bold">Reset</span>
                    </button>
                </div>

                <div className="w-full bg-white dark:bg-[#1b1f23] p-4 text-center border-b border-gray-100 dark:border-gray-800/50">
                    <h2 className="text-xl font-bold dark:text-gray-100">Daily Puzzle: Hearts & Crowns</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Proposal Edition • Personalized for You</p>
                </div>

                <div className="p-4 sm:p-6 w-full flex justify-center bg-gray-50 dark:bg-[#111315]">
                    <div 
                        className="grid gap-0 border-2 border-slate-800 dark:border-slate-900 shadow-inner"
                        style={{ 
                            gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`,
                            width: 'min(85vw, 360px)',
                            height: 'min(85vw, 360px)'
                        }}
                    >
                        {GRID_MAP.map((row, r) => 
                            row.map((regionId, c) => {
                                const isQueen = queens.some(q => q.r === r && q.c === c);
                                const isManualMark = manualMarks.some(m => m.r === r && m.c === c);
                                const isAutoMark = autoMarks[r][c];
                                const isError = errors.some(e => e.r === r && e.c === c);
                                const isHeart = regionId === 9;
                                
                                const borderTop = r > 0 && GRID_MAP[r-1][c] !== regionId ? 'border-t-[3px]' : 'border-t-[0.5px]';
                                const borderLeft = c > 0 && GRID_MAP[r][c-1] !== regionId ? 'border-l-[3px]' : 'border-l-[0.5px]';
                                
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => toggleCell(r, c)}
                                        className={`
                                            relative flex items-center justify-center cursor-pointer select-none
                                            ${REGION_COLORS[regionId]}
                                            ${BORDER_COLORS[regionId]}
                                            ${borderTop} ${borderLeft}
                                            w-full h-full box-border
                                        `}
                                    >
                                        {(isQueen || isManualMark || isAutoMark) && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                {isQueen ? (
                                                    <div className={`
                                                        flex items-center justify-center transition-all animate-in zoom-in-50 duration-200
                                                        ${isError ? 'text-white bg-red-600 rounded-full w-4/5 h-4/5' : isHeart ? 'text-white drop-shadow-md' : 'text-slate-900'}
                                                    `}>
                                                        <Crown fill="currentColor" size="70%" />
                                                    </div>
                                                ) : (
                                                    <div className={`
                                                        flex items-center justify-center transition-all animate-in zoom-in-75 duration-100
                                                        ${isManualMark ? 'opacity-80 font-bold scale-110' : 'opacity-40'} 
                                                        ${(isHeart || regionId === 1 || regionId === 2 || regionId === 8) ? 'text-white' : 'text-slate-900'}
                                                    `}>
                                                        <X size="50%" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="w-full bg-white dark:bg-[#1b1f23] p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                        Place exactly 9 Queens. No two queens may share a row, column, color region, or touch diagonally.
                    </p>
                </div>
            </div>

            {solved && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1b1f23] rounded-lg max-w-sm w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="h-2 bg-[#0a66c2] w-full" />
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 scale-in-center">
                                <Heart size={32} fill="currentColor" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Checkmate.</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm italic">"Every queen has found her place."</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium animate-pulse">
                                Advancing automatically...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showRules && (
                <div id="queens-rules-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[60] animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1b1f23] rounded-xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 overflow-hidden">
                        <div className="bg-[#0a66c2] p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <Info size={18} /> How to Play Queens
                            </h3>
                            <button 
                                type="button"
                                onClick={() => setShowRules(false)}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex gap-3">
                                <div className="text-[#0a66c2] mt-1 shrink-0"><Crown size={18} fill="currentColor" /></div>
                                <p>Place exactly <strong>9 Queens</strong> on the grid.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-slate-400 mt-1 shrink-0"><X size={18} /></div>
                                <p>Exactly one queen per <strong>row</strong>, <strong>column</strong>, and <strong>color region</strong>.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-red-500 mt-1 shrink-0">⚠️</div>
                                <p>No two queens may be **adjacent**, including diagonally (they cannot touch).</p>
                            </div>
                            <div className="pt-2 border-t dark:border-gray-800">
                                <p className="text-xs text-gray-500 italic">Click a cell once for a Queen, twice for an X, and a third time to clear.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setShowRules(false)}
                                className="w-full py-2 bg-[#0a66c2] text-white rounded-lg font-bold mt-2 hover:bg-[#084e96] transition-colors"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
