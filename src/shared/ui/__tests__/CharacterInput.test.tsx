// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CharacterInput } from '../CharacterInput';

describe('CharacterInput', () => {
    let onComplete: any;

    beforeEach(() => {
        onComplete = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders input boxes for alphabetic chars and spans for apostrophes', () => {
        render(<CharacterInput expectedValue="it's" onComplete={onComplete} />);

        // 'i', 't', 's' should be inputs; apostrophe should be a span
        expect(screen.getByTestId('input-0')).toBeTruthy();
        expect(screen.getByTestId('input-1')).toBeTruthy();
        expect(screen.getByTestId('static-2')).toBeTruthy();
        expect(screen.getByTestId('input-3')).toBeTruthy();
    });

    it('auto-focuses next input on typing, skipping static chars', () => {
        render(<CharacterInput expectedValue="it's" onComplete={onComplete} />);

        const inputI = screen.getByTestId('input-0') as HTMLInputElement;
        const inputT = screen.getByTestId('input-1') as HTMLInputElement;

        inputI.focus();
        fireEvent.change(inputI, { target: { value: 'i' } });
        expect(document.activeElement).toBe(inputT);

        // typing 't' should skip the apostrophe and focus 's'
        fireEvent.change(inputT, { target: { value: 't' } });
        const inputS = screen.getByTestId('input-3') as HTMLInputElement;
        expect(document.activeElement).toBe(inputS);
    });

    it('moves focus back on backspace from empty input', () => {
        render(<CharacterInput expectedValue="HI" onComplete={onComplete} />);

        const input0 = screen.getByTestId('input-0') as HTMLInputElement;
        const input1 = screen.getByTestId('input-1') as HTMLInputElement;

        input0.focus();
        fireEvent.change(input0, { target: { value: 'H' } });

        // input1 is focused but empty — press backspace
        fireEvent.keyDown(input1, { key: 'Backspace' });
        expect(document.activeElement).toBe(input0);
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

    it('makes inputs read-only when locked', () => {
        render(<CharacterInput expectedValue="HI" onComplete={onComplete} locked={true} />);

        const input0 = screen.getByTestId('input-0') as HTMLInputElement;
        expect(input0.readOnly).toBe(true);
    });
});
