import React, { useState, useEffect, useMemo } from 'react';
import { Crown, Heart, RotateCcw, Info, X } from 'lucide-react';

// Grid Data based on user's map (9x9)
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

const REGION_COLORS = {
  1: 'bg-[#cbd5e1]', 2: 'bg-[#94a3b8]', 3: 'bg-[#d1d5db]',
  4: 'bg-[#e2e8f0]', 5: 'bg-[#9ca3af]', 6: 'bg-[#64748b]',
  7: 'bg-[#bfdbfe]', 8: 'bg-[#f1f5f9]', 9: 'bg-[#be123c]',
};

const BORDER_COLORS = {
  1: 'border-slate-500', 2: 'border-slate-600', 3: 'border-gray-500',
  4: 'border-slate-400', 5: 'border-gray-600', 6: 'border-slate-700',
  7: 'border-blue-400', 8: 'border-slate-300', 9: 'border-rose-900',
};

export default function App() {
  const [queens, setQueens] = useState([]); // Array of {r, c}
  const [manualMarks, setManualMarks] = useState([]); // Array of {r, c}
  const [solved, setSolved] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Auto-calculated illegal cells based on placed queens
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

  // Conflict detection
  const errors = useMemo(() => {
    const errorCells = [];
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

  // Click cycle: Empty -> Queen -> Manual X -> Empty
  const toggleCell = (r, c) => {
    if (solved) return;
    
    const queenIndex = queens.findIndex(q => q.r === r && q.c === c);
    const markIndex = manualMarks.findIndex(m => m.r === r && m.c === c);

    if (queenIndex > -1) {
      // Transition from Queen to Manual X
      setQueens(queens.filter((_, i) => i !== queenIndex));
      setManualMarks([...manualMarks, { r, c }]);
    } else if (markIndex > -1) {
      // Transition from Manual X to Empty
      setManualMarks(manualMarks.filter((_, i) => i !== markIndex));
    } else {
      // Transition from Empty to Queen
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

  const resetGame = () => {
    setQueens([]);
    setManualMarks([]);
    setSolved(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center p-4 font-sans text-[#000000e6]">
      <div className="w-full max-w-4xl bg-white border-b border-gray-200 fixed top-0 left-0 right-0 h-14 flex items-center justify-center z-30 px-4">
        <div className="w-full max-w-md flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-[#0a66c2] p-1 rounded text-white font-bold text-lg leading-none">Q</div>
            <span className="font-semibold text-sm">Queens</span>
          </div>
          <button onClick={resetGame} className="text-gray-500 hover:text-black flex flex-col items-center text-[10px]">
            <RotateCcw size={20} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <main className="mt-20 w-full max-w-md flex flex-col items-center">
        <div className="w-full bg-white rounded-t-lg border border-gray-200 border-b-0 p-4">
          <h2 className="text-xl font-bold">Daily Puzzle: Hearts & Crowns</h2>
          <p className="text-xs text-gray-500">Proposal Edition • Personalized for You</p>
        </div>

        <div className="bg-white border border-gray-200 p-2 sm:p-4 w-full flex justify-center">
          <div 
            className="grid gap-0 border-2 border-slate-800 shadow-inner"
            style={{ 
              gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`,
              width: 'min(85vw, 400px)',
              height: 'min(85vw, 400px)'
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
                    {isQueen ? (
                      <div className={`
                        flex items-center justify-center transition-all
                        ${isError ? 'text-white bg-red-600 rounded-full w-4/5 h-4/5' : isHeart ? 'text-white' : 'text-slate-900'}
                      `}>
                        <Crown fill="currentColor" size="70%" />
                      </div>
                    ) : (isManualMark || isAutoMark) ? (
                      <div className={`
                        ${isManualMark ? 'opacity-60 font-bold scale-110' : 'opacity-20'} 
                        ${isHeart ? 'text-white' : 'text-slate-800'}
                      `}>
                        <X size="50%" />
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="w-full bg-white rounded-b-lg border border-gray-200 border-t-0 p-4 mb-10">
           <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-300" />)}
                 <span className="text-xs text-gray-500 pl-4 font-medium flex items-center">8 others solved this</span>
              </div>
              <button onClick={() => setShowIntro(true)} className="text-[#0a66c2] text-sm font-bold hover:underline">Rules</button>
           </div>
        </div>
      </main>

      {solved && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-lg max-w-sm w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="h-2 bg-[#0a66c2] w-full" />
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Congratulations!</h2>
              <p className="text-gray-600 mb-6 text-sm italic">"Every queen has found her place."</p>
              <div className="bg-slate-50 p-4 rounded border border-gray-200 text-left mb-6">
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 font-mono">ENVELOPE CODE: ❤️</p>
                 <p className="text-sm font-medium">Check the envelope inside the small wooden box on the bookshelf.</p>
              </div>
              <button onClick={() => setSolved(false)} className="w-full bg-[#0a66c2] text-white font-bold py-2 rounded-full hover:bg-[#004182]">Close</button>
            </div>
          </div>
        </div>
      )}

      {showIntro && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-6">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
            <h1 className="text-2xl font-bold mb-4">How to Play</h1>
            <div className="space-y-4 text-gray-600 text-sm mb-8">
              <p>1. Place exactly <strong>9 Queens</strong> on the board.</p>
              <p>2. There must be exactly <strong>one Queen</strong> in every row, column, and colored region.</p>
              <p>3. Two Queens <strong>cannot touch</strong> each other (including diagonally).</p>
              <p className="italic bg-blue-50 p-3 rounded text-blue-800 border-l-4 border-blue-500">
                Tip: Click once for a Queen, twice to mark with an 'X', and three times to clear.
              </p>
            </div>
            <button onClick={() => setShowIntro(false)} className="w-full bg-[#0a66c2] text-white font-bold py-3 rounded-full hover:bg-[#004182]">Start Game</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation: 300ms ease-out both; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in-95; }
      `}</style>
    </div>
  );
}