import React, { useState, useRef, useCallback } from 'react';

import versoImg from '../assets/verso.png';
import maelleImg from '../assets/maelle.png';
import scielImg from '../assets/sciel.png';
import esquieImg from '../assets/esquie.png';
import gustaveImg from '../assets/gustave.png';
import simonImg from '../assets/simon.png';
import luneImg from '../assets/lune.png';
import monokoImg from '../assets/monoko.png';
import sophieImg from '../assets/sophie.png';

// ─── Types & Constants ──────────────────────────────────────────

interface Character {
    id: string;
    name: string;
    image: string;
}

interface SlotState {
    slotLabel: string;
    assignedCharacter: string | null;
}

const CHARACTERS: Character[] = [
    { id: 'verso', name: 'Verso', image: versoImg },
    { id: 'maelle', name: 'Maëlle', image: maelleImg },
    { id: 'sciel', name: 'Sciel', image: scielImg },
    { id: 'esquie', name: 'Esquie', image: esquieImg },
    { id: 'gustave', name: 'Gustave', image: gustaveImg },
    { id: 'lune', name: 'Lune', image: luneImg },
    { id: 'monoko', name: 'Monoko', image: monokoImg },
    { id: 'simon', name: 'Simon', image: simonImg },
    { id: 'sophie', name: 'Sophie', image: sophieImg },
];

const INITIAL_SLOTS: SlotState[] = [
    { slotLabel: 'Free Aim Spammer', assignedCharacter: null },
    { slotLabel: 'Offense / Damage', assignedCharacter: null },
    { slotLabel: 'Support', assignedCharacter: null },
];

const CORRECT_ASSIGNMENT: Record<string, string> = {
    'Free Aim Spammer': 'verso',
    'Offense / Damage': 'maelle',
    'Support': 'sciel',
};

// ─── Component ──────────────────────────────────────────────────

export interface TeamBuilderStageProps {
    onAdvance: () => void;
}

export const TeamBuilderStage: React.FC<TeamBuilderStageProps> = ({ onAdvance }) => {
    const [slots, setSlots] = useState<SlotState[]>(INITIAL_SLOTS.map(s => ({ ...s })));
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [shakingSlots, setShakingSlots] = useState<Set<number>>(new Set());
    const [simonTriggered, setSimonTriggered] = useState(false);
    const [simonErased, setSimonErased] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Touch-drag state
    const [dragClone, setDragClone] = useState<{ characterId: string; x: number; y: number } | null>(null);
    const touchCharRef = useRef<string | null>(null);
    const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

    // ─ Helpers ─

    const getCharacterById = (id: string): Character | undefined =>
        CHARACTERS.find(c => c.id === id);

    const isCharacterInSlot = (charId: string): boolean =>
        slots.some(s => s.assignedCharacter === charId);

    const allSlotsFilled = slots.every(s => s.assignedCharacter !== null);

    // ─ Simon Easter Egg ─

    const triggerSimonGommage = useCallback(() => {
        setSimonTriggered(true);
        setTimeout(() => {
            setSimonTriggered(false);
            setSimonErased(true);
        }, 3000);
    }, []);

    // ─ Drop Logic ─

    const handleDropCharacter = useCallback((characterId: string, slotIndex: number) => {
        // Simon easter egg check
        if (characterId === 'simon') {
            triggerSimonGommage();
            return;
        }

        setErrorMessage(null);

        setSlots(prev => {
            const next = prev.map(s => ({ ...s }));

            // If this character is already in another slot, remove it
            for (let i = 0; i < next.length; i++) {
                if (next[i].assignedCharacter === characterId) {
                    next[i].assignedCharacter = null;
                }
            }

            // If the target slot had a different character, that character returns to roster
            // (just clearing the slot is enough since roster is computed from state)
            next[slotIndex].assignedCharacter = characterId;

            return next;
        });
    }, [triggerSimonGommage]);

    // ─ HTML5 Drag & Drop (Desktop) ─

    const handleDragStart = (e: React.DragEvent, characterId: string) => {
        e.dataTransfer.setData('text/plain', characterId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, slotIndex: number) => {
        e.preventDefault();
        const characterId = e.dataTransfer.getData('text/plain');
        if (characterId) {
            handleDropCharacter(characterId, slotIndex);
        }
    };

    // ─ Touch Drag (Mobile) ─

    const handleTouchStart = (e: React.TouchEvent, characterId: string) => {
        const touch = e.touches[0];
        touchCharRef.current = characterId;
        setDragClone({ characterId, x: touch.clientX, y: touch.clientY });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!dragClone) return;
        const touch = e.touches[0];
        setDragClone(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchCharRef.current || !dragClone) {
            setDragClone(null);
            touchCharRef.current = null;
            return;
        }

        const touch = e.changedTouches[0];
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

        // Find which slot was targeted
        for (let i = 0; i < slotRefs.current.length; i++) {
            const slotEl = slotRefs.current[i];
            if (slotEl && (slotEl === dropTarget || slotEl.contains(dropTarget))) {
                handleDropCharacter(touchCharRef.current, i);
                break;
            }
        }

        setDragClone(null);
        touchCharRef.current = null;
    };

    // ─ Validation ─

    const handleConfirm = () => {
        if (!allSlotsFilled) return;

        const wrongIndices: number[] = [];
        slots.forEach((slot, i) => {
            if (CORRECT_ASSIGNMENT[slot.slotLabel] !== slot.assignedCharacter) {
                wrongIndices.push(i);
            }
        });

        if (wrongIndices.length === 0) {
            // All correct!
            setIsCorrect(true);
            setTimeout(() => {
                onAdvance();
            }, 1500);
        } else {
            // Wrong — shake + error + clear
            setShakingSlots(new Set(wrongIndices));
            setErrorMessage("That's not quite right...");
            setTimeout(() => {
                setShakingSlots(new Set());
                setSlots(INITIAL_SLOTS.map(s => ({ ...s })));
            }, 800);
        }
    };

    // ─ Render ─

    const dragCloneChar = dragClone ? getCharacterById(dragClone.characterId) : null;

    return (
        <div className="w-full h-full flex items-center justify-center">
            <style>
                {`
                    @keyframes shakeSlot {
                        0%, 100% { transform: translateX(0); }
                        20% { transform: translateX(-8px); }
                        40% { transform: translateX(8px); }
                        60% { transform: translateX(-6px); }
                        80% { transform: translateX(6px); }
                    }
                    .shake-anim {
                        animation: shakeSlot 0.5s ease-in-out;
                    }

                    @keyframes successGlow {
                        0% { box-shadow: 0 0 10px rgba(234, 179, 8, 0.3); border-color: rgba(234, 179, 8, 0.5); }
                        50% { box-shadow: 0 0 40px rgba(234, 179, 8, 0.8); border-color: rgba(234, 179, 8, 1); }
                        100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.5); border-color: rgba(234, 179, 8, 0.8); }
                    }
                    .success-slot {
                        animation: successGlow 1s ease-in-out infinite;
                    }

                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .fade-in-up {
                        animation: fadeInUp 0.6s ease-out forwards;
                    }

                    @keyframes whiteOut {
                        0% { opacity: 0; }
                        20% { opacity: 1; }
                        80% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                    .white-out-overlay {
                        animation: whiteOut 2.5s ease-in-out forwards;
                    }

                    @keyframes simonDissolve {
                        0% { opacity: 1; transform: scale(1); }
                        100% { opacity: 0; transform: scale(0.3); }
                    }
                    .simon-dissolve {
                        animation: simonDissolve 1.5s ease-in forwards;
                    }

                    .slot-drop-zone {
                        transition: all 0.2s ease;
                    }
                    .slot-drop-zone:hover,
                    .slot-drop-zone.drag-over {
                        border-color: rgba(16, 185, 129, 0.8);
                        box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
                        background: rgba(16, 185, 129, 0.08);
                    }

                    .roster-card {
                        transition: all 0.2s ease;
                        cursor: grab;
                    }
                    .roster-card:active {
                        cursor: grabbing;
                        transform: scale(0.95);
                    }
                    .roster-card.dimmed {
                        opacity: 0.35;
                        filter: grayscale(0.6);
                    }
                `}
            </style>

            {/* Simon "Gommage" overlay */}
            {simonTriggered && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-white white-out-overlay" />
                    <div className="relative z-10 flex flex-col items-center space-y-4">
                        <img
                            src={simonImg}
                            alt="Simon"
                            className="w-24 h-24 rounded-full simon-dissolve"
                        />
                        <p className="text-emerald-600 italic text-xl font-serif fade-in-up"
                            style={{ animationDelay: '0.8s', opacity: 0 }}>
                            Huh, why was he even here?
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-2xl mx-auto relative px-4 text-center">
                {/* Title */}
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white font-serif">
                        Create the Perfect Team!
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Drag the right characters into their roles.
                    </p>
                </div>

                {/* Slots */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {slots.map((slot, i) => {
                        const assignedChar = slot.assignedCharacter
                            ? getCharacterById(slot.assignedCharacter)
                            : null;

                        return (
                            <div
                                key={slot.slotLabel}
                                ref={el => { slotRefs.current[i] = el; }}
                                data-slot-index={i}
                                className={`
                                    slot-drop-zone flex flex-col items-center justify-center
                                    w-28 h-36 md:w-32 md:h-40
                                    border-2 border-dashed rounded-xl
                                    ${isCorrect
                                        ? 'success-slot border-yellow-400'
                                        : assignedChar
                                            ? 'border-emerald-500/60 bg-emerald-900/20'
                                            : 'border-emerald-500/30 bg-black/30'
                                    }
                                    ${shakingSlots.has(i) ? 'shake-anim' : ''}
                                `}
                                onDragOver={handleDragOver}
                                onDrop={e => handleDrop(e, i)}
                            >
                                {assignedChar ? (
                                    <div className="flex flex-col items-center space-y-1">
                                        <img
                                            src={assignedChar.image}
                                            alt={assignedChar.name}
                                            className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover border border-emerald-500/40"
                                            draggable
                                            onDragStart={e => handleDragStart(e, assignedChar.id)}
                                            onTouchStart={e => handleTouchStart(e, assignedChar.id)}
                                            onTouchMove={handleTouchMove}
                                            onTouchEnd={handleTouchEnd}
                                        />
                                        <span className="text-emerald-300 text-xs font-medium">
                                            {assignedChar.name}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-emerald-500/50 text-xs font-medium px-1 text-center">
                                        Drop here
                                    </span>
                                )}
                                <span className="text-emerald-400/70 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1 px-1 text-center">
                                    {slot.slotLabel}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Roster */}
                <div className="pt-4 border-t border-emerald-500/10 w-full" style={{ touchAction: 'none' }}>
                    <p className="text-emerald-500/60 text-xs uppercase tracking-widest mb-3">
                        Roster
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        {CHARACTERS.filter(c => !(c.id === 'simon' && simonErased)).map(char => {
                            const inSlot = isCharacterInSlot(char.id);
                            return (
                                <div
                                    key={char.id}
                                    className={`roster-card flex flex-col items-center space-y-1 p-2 rounded-xl border
                                        ${inSlot
                                            ? 'dimmed border-slate-700/30'
                                            : 'border-emerald-500/30 bg-black/40 hover:border-emerald-400/60 hover:bg-emerald-900/10'
                                        }
                                    `}
                                    draggable={!inSlot}
                                    onDragStart={e => handleDragStart(e, char.id)}
                                    onTouchStart={e => handleTouchStart(e, char.id)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <img
                                        src={char.image}
                                        alt={char.name}
                                        className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
                                        draggable={false}
                                    />
                                    <span className="text-gray-300 text-xs font-medium">
                                        {char.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <p className="text-red-400 text-md animate-pulse font-medium">
                        {errorMessage}
                    </p>
                )}

                {/* Success Message */}
                {isCorrect && (
                    <p className="text-yellow-300 text-2xl font-bold font-serif fade-in-up">
                        ✨ Perfect Team! ✨
                    </p>
                )}

                {/* Confirm Button */}
                {!isCorrect && (
                    <button
                        onClick={handleConfirm}
                        disabled={!allSlotsFilled}
                        className={`
                            px-8 py-3 rounded uppercase tracking-widest font-bold text-sm transition-all duration-300 border
                            ${allSlotsFilled
                                ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400 hover:bg-emerald-800 hover:text-white cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'bg-black/20 border-slate-700/30 text-slate-600 cursor-not-allowed'
                            }
                        `}
                    >
                        Confirm Team
                    </button>
                )}
            </div>

            {/* Touch-drag clone */}
            {dragClone && dragCloneChar && (
                <img
                    src={dragCloneChar.image}
                    alt="Dragging"
                    className="rounded-lg border-2 border-emerald-400 shadow-2xl"
                    style={{
                        position: 'fixed',
                        left: dragClone.x - 40,
                        top: dragClone.y - 40,
                        width: 80,
                        height: 80,
                        pointerEvents: 'none',
                        zIndex: 50,
                        objectFit: 'cover',
                    }}
                />
            )}
        </div>
    );
};
