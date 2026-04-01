import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKeyboardInput } from '../useKeyboardInput';

describe('useKeyboardInput', () => {
    const callbacks = {
        onKey: vi.fn(),
        onBackspace: vi.fn(),
        onEnter: vi.fn(),
        onMove: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call onKey when a letter is pressed', () => {
        renderHook(() => useKeyboardInput(callbacks));
        
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        expect(callbacks.onKey).toHaveBeenCalledWith('A');
        
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Z' }));
        expect(callbacks.onKey).toHaveBeenCalledWith('Z');
    });

    it('should call onKey with space when space is pressed', () => {
        renderHook(() => useKeyboardInput(callbacks));
        
        window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
        expect(callbacks.onKey).toHaveBeenCalledWith(' ');
    });

    it('should call onBackspace when Backspace is pressed', () => {
        renderHook(() => useKeyboardInput(callbacks));
        
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
        expect(callbacks.onBackspace).toHaveBeenCalled();
    });

    it('should call onEnter when Enter is pressed', () => {
        renderHook(() => useKeyboardInput(callbacks));
        
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(callbacks.onEnter).toHaveBeenCalled();
    });

    it('should call onMove when arrow keys are pressed', () => {
        renderHook(() => useKeyboardInput(callbacks));
        
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        expect(callbacks.onMove).toHaveBeenCalledWith('left');
        
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        expect(callbacks.onMove).toHaveBeenCalledWith('right');
    });

    it('should not call onKey for modifier keys', () => {
        renderHook(() => useKeyboardInput(callbacks));
        
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }));
        expect(callbacks.onKey).not.toHaveBeenCalled();
        
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', metaKey: true }));
        expect(callbacks.onKey).not.toHaveBeenCalled();
    });
});
