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

const VIBRATION_INTERVAL_MS = 500;

export const useLongPress = ({ durationMs, onComplete, onProgress, vibrate = true }: UseLongPressOptions): UseLongPressReturn => {
    const [isActive, setIsActive] = useState(false);

    const holdStartRef = useRef<number | null>(null);
    const animFrameRef = useRef<number>(0);
    const lastVibrationRef = useRef<number>(0);

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

        // Vibrate in pulses
        if (vibrate && navigator.vibrate) {
            const vibrationStep = Math.floor(elapsed / VIBRATION_INTERVAL_MS);
            if (vibrationStep > lastVibrationRef.current) {
                navigator.vibrate(50);
                lastVibrationRef.current = vibrationStep;
            }
        }

        if (p >= 1) {
            if (vibrate) navigator.vibrate?.(200);
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
        lastVibrationRef.current = 0;
        holdStartRef.current = performance.now();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(updateProgress);
    }, [updateProgress]);

    const handlePointerCancelOrUp = useCallback(() => {
        setIsActive(false);
        onProgressRef.current?.(0);
        holdStartRef.current = null;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }, []);

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
