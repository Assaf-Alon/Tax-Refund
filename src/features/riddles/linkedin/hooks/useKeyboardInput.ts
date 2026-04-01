import { useEffect } from 'react';

interface KeyboardCallbacks {
    onKey: (key: string) => void;
    onBackspace: () => void;
    onEnter: () => void;
    onMove?: (direction: 'left' | 'right') => void;
}

/**
 * Custom hook to handle physical keyboard input for the LinkedIn-style games.
 * Handles A-Z, 0-9, Space, Backspace, Enter, and Arrow keys.
 */
export const useKeyboardInput = (callbacks: KeyboardCallbacks) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if modifier keys are pressed (e.g., Ctrl+R, Cmd+V)
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === 'Enter') {
                callbacks.onEnter();
            } else if (e.key === 'Backspace') {
                callbacks.onBackspace();
            } else if (e.key === ' ') {
                e.preventDefault(); // Prevent page scroll
                callbacks.onKey(' ');
            } else if (e.key === 'ArrowLeft') {
                callbacks.onMove?.('left');
            } else if (e.key === 'ArrowRight') {
                callbacks.onMove?.('right');
            } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                // Handle letters and numbers, normalizing to uppercase
                callbacks.onKey(e.key.toUpperCase());
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [callbacks]);
};
