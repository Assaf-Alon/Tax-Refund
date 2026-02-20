// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CharacterInput } from '../CharacterInput';

describe('CharacterInput', () => {
    let onComplete: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onComplete = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders input boxes for alphabetic chars and spans for static chars', () => {
        render(<CharacterInput expectedValue="A B" onComplete={onComplete} />);

        // 'A' and 'B' should be inputs, ' ' should be a span
        expect(screen.getByTestId('input-0')).toBeTruthy();
        expect(screen.getByTestId('static-1')).toBeTruthy();
        expect(screen.getByTestId('input-2')).toBeTruthy();
    });

    it('auto-focuses next input on typing, skipping static chars', () => {
        render(<CharacterInput expectedValue="A B" onComplete={onComplete} />);

        const inputA = screen.getByTestId('input-0') as HTMLInputElement;
        const inputB = screen.getByTestId('input-2') as HTMLInputElement;

        // Focus first input and type
        inputA.focus();
        fireEvent.change(inputA, { target: { value: 'A' } });

        // Focus should jump to inputB (skipping the space span)
        expect(document.activeElement).toBe(inputB);
    });

    it('moves focus back on backspace from empty input, skipping static chars', () => {
        render(<CharacterInput expectedValue="A B" onComplete={onComplete} />);

        const inputA = screen.getByTestId('input-0') as HTMLInputElement;
        const inputB = screen.getByTestId('input-2') as HTMLInputElement;

        // Type A first to fill it
        inputA.focus();
        fireEvent.change(inputA, { target: { value: 'A' } });

        // Now inputB is focused but empty — press backspace
        fireEvent.keyDown(inputB, { key: 'Backspace' });

        // Focus should jump back to inputA
        expect(document.activeElement).toBe(inputA);
    });

    it('calls onComplete when all characters match', () => {
        render(<CharacterInput expectedValue="HI" onComplete={onComplete} />);

        const input0 = screen.getByTestId('input-0') as HTMLInputElement;
        const input1 = screen.getByTestId('input-1') as HTMLInputElement;

        fireEvent.change(input0, { target: { value: 'H' } });
        fireEvent.change(input1, { target: { value: 'I' } });

        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('does not call onComplete for incorrect characters', () => {
        render(<CharacterInput expectedValue="HI" onComplete={onComplete} />);

        const input0 = screen.getByTestId('input-0') as HTMLInputElement;
        const input1 = screen.getByTestId('input-1') as HTMLInputElement;

        fireEvent.change(input0, { target: { value: 'X' } });
        fireEvent.change(input1, { target: { value: 'Y' } });

        expect(onComplete).not.toHaveBeenCalled();
    });
});
