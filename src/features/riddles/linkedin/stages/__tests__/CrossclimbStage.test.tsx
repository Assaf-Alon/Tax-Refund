// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { CrossclimbStage } from '../CrossclimbStage';

// Mock CharacterInput to provide a button we can click to 'solve' a word
vi.mock('../../../../../shared/ui/CharacterInput', () => ({
    CharacterInput: ({ onComplete, expectedValue }: { onComplete: () => void, expectedValue: string }) => (
        <button onClick={onComplete}>Solve {expectedValue}</button>
    ),
}));

describe('CrossclimbStage', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('requires typing (solving) words before they are revealed', () => {
        render(<CrossclimbStage onAdvance={vi.fn()} />);
        // Words should NOT be revealed initially (they are in CharacterInput)
        expect(screen.queryByText('SPARK')).toBeNull();
        expect(screen.getByText('Solve spark')).toBeTruthy();
    });

    it('locks end caps until middle rows are solved and correctly ordered', () => {
        // Mock Math.random to prevent shuffling so they are already in the correct order
        vi.spyOn(Math, 'random').mockReturnValue(0.99);

        render(<CrossclimbStage onAdvance={vi.fn()} />);
        
        // Both end caps are locked initially
        expect(screen.getAllByLabelText('locked')).toHaveLength(2);
        
        // Solve middle rows
        fireEvent.click(screen.getByText('Solve spark'));
        fireEvent.click(screen.getByText('Solve spare'));
        fireEvent.click(screen.getByText('Solve share'));
        fireEvent.click(screen.getByText('Solve shore'));
        
        // Because they were not shuffled, they are in perfect order. They should unlock automatically!
        expect(screen.queryByLabelText('locked')).toBeNull();
        expect(screen.getByText('Solve stark')).toBeTruthy();
        expect(screen.getByText('Solve store')).toBeTruthy();
    });
});
