import { useState, useRef, useCallback } from 'react';

export interface UseDragAndDropOptions {
    onDrop: (itemId: string, dropZoneIndex: number) => void;
}

export interface DragState {
    characterId: string;
    x: number;
    y: number;
}

export interface UseDragAndDropReturn {
    dragState: DragState | null;
    dragHandlers: {
        onDragStart: (e: React.DragEvent, id: string) => void;
        onTouchStart: (e: React.TouchEvent, id: string) => void;
        onTouchMove: (e: React.TouchEvent) => void;
        onTouchEnd: (e: React.TouchEvent) => void;
    };
    dropHandlers: {
        onDragOver: (e: React.DragEvent) => void;
        onDrop: (e: React.DragEvent, dropZoneIndex: number) => void;
    };
    slotRefs: React.MutableRefObject<(HTMLElement | null)[]>;
}

export function useDragAndDrop({ onDrop }: UseDragAndDropOptions): UseDragAndDropReturn {
    const [dragState, setDragState] = useState<DragState | null>(null);
    const touchCharRef = useRef<string | null>(null);
    const slotRefs = useRef<(HTMLElement | null)[]>([]);

    const handleDragStart = useCallback((e: React.DragEvent, characterId: string) => {
        e.dataTransfer.setData('text/plain', characterId);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, slotIndex: number) => {
        e.preventDefault();
        const characterId = e.dataTransfer.getData('text/plain');
        if (characterId) {
            onDrop(characterId, slotIndex);
        }
    }, [onDrop]);

    const handleTouchStart = useCallback((e: React.TouchEvent, characterId: string) => {
        const touch = e.touches[0];
        touchCharRef.current = characterId;
        setDragState({ characterId, x: touch.clientX, y: touch.clientY });
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchCharRef.current) return;
        const touch = e.touches[0];
        setDragState(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null);
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!touchCharRef.current || !dragState) {
            setDragState(null);
            touchCharRef.current = null;
            return;
        }

        const touch = e.changedTouches[0];
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

        if (dropTarget) {
            for (let i = 0; i < slotRefs.current.length; i++) {
                const slotEl = slotRefs.current[i];
                if (slotEl && (slotEl === dropTarget || slotEl.contains(dropTarget))) {
                    onDrop(touchCharRef.current, i);
                    break;
                }
            }
        }

        setDragState(null);
        touchCharRef.current = null;
    }, [dragState, onDrop]);

    return {
        dragState,
        dragHandlers: {
            onDragStart: handleDragStart,
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
        dropHandlers: {
            onDragOver: handleDragOver,
            onDrop: handleDrop,
        },
        slotRefs,
    };
}
