// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { HintButton } from '../HintButton';

describe('HintButton', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('shows countdown and is disabled initially', () => {
        render(<HintButton hint="Test hint" cooldownSeconds={5} />);

        const button = screen.getByRole('button') as HTMLButtonElement;
        expect(button.disabled).toBe(true);
        expect(button.textContent).toContain('5s');
    });

    it('enables the button after the cooldown expires', () => {
        render(<HintButton hint="Test hint" cooldownSeconds={3} />);

        // Advance time inside act to flush React state updates
        act(() => {
            vi.advanceTimersByTime(3000);
        });

        const button = screen.getByRole('button') as HTMLButtonElement;
        expect(button.disabled).toBe(false);
        expect(button.textContent).toContain('Show Hint');
    });

    it('shows the hint text when clicked after cooldown', () => {
        render(<HintButton hint="Secret hint" cooldownSeconds={1} />);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        const button = screen.getByRole('button') as HTMLButtonElement;
        fireEvent.click(button);

        expect(screen.getByText('Secret hint')).toBeTruthy();
    });

    it('does not show hint when clicked before cooldown', () => {
        render(<HintButton hint="Secret hint" cooldownSeconds={10} />);

        const button = screen.getByRole('button') as HTMLButtonElement;
        fireEvent.click(button);

        expect(screen.queryByText('Secret hint')).toBeNull();
    });
});
