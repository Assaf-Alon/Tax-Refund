import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseLongPressOptions {
    durationMs: number;
    onComplete: () => void;
    onProgress?: (progress: number) => void;
    vibrate?: boolean;
}

export interface UseLongPressReturn {
    handlers: {
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
        onPointerUp: () => void;
        onPointerLeave: () => void;
        onPointerCancel: () => void;
        onContextMenu: (e: React.MouseEvent<HTMLElement>) => void;
    };
    isActive: boolean;
}



export const useLongPress = ({ durationMs, onComplete, onProgress, vibrate = true }: UseLongPressOptions): UseLongPressReturn => {
    const [isActive, setIsActive] = useState(false);

    const holdStartRef = useRef<number | null>(null);
    const animFrameRef = useRef<number>(0);


    const onCompleteRef = useRef(onComplete);
    const onProgressRef = useRef(onProgress);

    useEffect(() => {
        onCompleteRef.current = onComplete;
        onProgressRef.current = onProgress;
    }, [onComplete, onProgress]);

    const updateProgress = useCallback((time: number) => {
        if (holdStartRef.current === null) return;

        const elapsed = time - holdStartRef.current;
        const p = Math.min(elapsed / durationMs, 1);

        onProgressRef.current?.(p);

        if (p >= 1) {
            if (vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([50, 100, 50]);
            }
            setIsActive(false);
            holdStartRef.current = null;
            onCompleteRef.current();
            return;
        }
        animFrameRef.current = requestAnimationFrame(updateProgress);
    }, [durationMs, vibrate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
        e.preventDefault();
        setIsActive(true);
        onProgressRef.current?.(0);


        // Vibrate for the entire duration synchronously to bypass mobile browser restrictions
        if (vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(durationMs);
        }

        holdStartRef.current = performance.now();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(updateProgress);
    }, [updateProgress, durationMs, vibrate]);

    const handlePointerCancelOrUp = useCallback(() => {
        setIsActive(false);
        onProgressRef.current?.(0);
        holdStartRef.current = null;

        // Cancel vibration if they lift early
        if (vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(0);
        }

        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }, [vibrate]);

    const handleContextMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
    }, []);

    return {
        handlers: {
            onPointerDown: handlePointerDown,
            onPointerUp: handlePointerCancelOrUp,
            onPointerLeave: handlePointerCancelOrUp,
            onPointerCancel: handlePointerCancelOrUp,
            onContextMenu: handleContextMenu,
        },
        isActive,
    };
};
