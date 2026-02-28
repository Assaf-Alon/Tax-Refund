import React, { useState, useCallback, useMemo, useEffect } from 'react';

import versoImg from '../assets/verso.png';
import maelleImg from '../assets/maelle.png';
import scielImg from '../assets/sciel.png';
import esquieImg from '../assets/esquie.png';
import gustaveImg from '../assets/gustave.png';
import simonImg from '../assets/simon.png';
import luneImg from '../assets/lune.png';
import monokoImg from '../assets/monoko.png';
import sophieImg from '../assets/sophie.png';

import { useDragAndDrop } from '../../../../shared/hooks/useDragAndDrop';
import { shuffleArray } from '../../../../shared/utils/array';

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
    const shuffledCharacters = useMemo<Character[]>(() => shuffleArray(CHARACTERS), []);
    const [slots, setSlots] = useState<SlotState[]>(INITIAL_SLOTS.map(s => ({ ...s })));
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [shakingSlots, setShakingSlots] = useState<Set<number>>(new Set());
    const [simonTriggered, setSimonTriggered] = useState(false);
    const [simonErased, setSimonErased] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

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

    // ─ Drag & Drop ─

    const { dragState, dragHandlers, dropHandlers, slotRefs } = useDragAndDrop({
        onDrop: (characterId, slotIndex) => {
            if (characterId === 'simon') {
                triggerSimonGommage();
                return;
            }

            setErrorMessage(null);

            setSlots(prev => {
                const next = prev.map(s => ({ ...s }));
                for (let i = 0; i < next.length; i++) {
                    if (next[i].assignedCharacter === characterId) {
                        next[i].assignedCharacter = null;
                    }
                }
                next[slotIndex].assignedCharacter = characterId;
                return next;
            });
        }
    });

    // ─ Validation ─

    useEffect(() => {
        if (!allSlotsFilled) return;

        const wrongIndices: number[] = [];
        slots.forEach((slot, i) => {
            if (CORRECT_ASSIGNMENT[slot.slotLabel] !== slot.assignedCharacter) {
                wrongIndices.push(i);
            }
        });

        if (wrongIndices.length === 0) {
            setIsCorrect(true);
            setTimeout(() => {
                onAdvance();
            }, 1500);
        } else {
            setShakingSlots(new Set(wrongIndices));
            setErrorMessage("That's not quite right...");
            setTimeout(() => {
                setShakingSlots(new Set());
                setSlots(INITIAL_SLOTS.map(s => ({ ...s })));
            }, 800);
        }
    }, [allSlotsFilled, slots, onAdvance]);

    // ─ Render ─

    const dragCloneChar = dragState ? getCharacterById(dragState.characterId) : null;

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
                <div className="grid grid-cols-3 gap-2 w-full justify-items-center mb-4">
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
                                    w-full max-w-[112px] h-32 md:w-32 md:h-40
                                    border-2 border-dashed rounded-xl
                                    ${isCorrect
                                        ? 'success-slot border-yellow-400'
                                        : assignedChar
                                            ? 'border-emerald-500/60 bg-emerald-900/20'
                                            : 'border-emerald-500/30 bg-black/30'
                                    }
                                    ${shakingSlots.has(i) ? 'shake-anim' : ''}
                                `}
                                onDragOver={dropHandlers.onDragOver}
                                onDrop={e => dropHandlers.onDrop(e, i)}
                            >
                                {assignedChar ? (
                                    <div className="flex flex-col items-center space-y-1">
                                        <img
                                            src={assignedChar.image}
                                            alt={assignedChar.name}
                                            className="w-12 h-12 md:w-20 md:h-20 rounded-lg object-cover border border-emerald-500/40"
                                            draggable
                                            onDragStart={e => dragHandlers.onDragStart(e, assignedChar.id)}
                                            onTouchStart={e => dragHandlers.onTouchStart(e, assignedChar.id)}
                                            onTouchMove={dragHandlers.onTouchMove}
                                            onTouchEnd={dragHandlers.onTouchEnd}
                                        />
                                        <span className="text-emerald-300 text-[10px] md:text-xs font-medium">
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
                        {shuffledCharacters.filter(c => !(c.id === 'simon' && simonErased)).map(char => {
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
                                    onDragStart={e => dragHandlers.onDragStart(e, char.id)}
                                    onTouchStart={e => dragHandlers.onTouchStart(e, char.id)}
                                    onTouchMove={dragHandlers.onTouchMove}
                                    onTouchEnd={dragHandlers.onTouchEnd}
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


            </div>

            {/* Touch-drag clone */}
            {dragState && dragCloneChar && (
                <img
                    src={dragCloneChar.image}
                    alt="Dragging"
                    className="rounded-lg border-2 border-emerald-400 shadow-2xl"
                    style={{
                        position: 'fixed',
                        left: dragState.x - 40,
                        top: dragState.y - 40,
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
