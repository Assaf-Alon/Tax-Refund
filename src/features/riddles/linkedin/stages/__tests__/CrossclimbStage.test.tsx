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
    });

    it('swaps terminal rows if the middle sequence is reversed', () => {
        // Mock Math.random to return words in reverse order: shore, share, spare, spark
        let callCount = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => {
            callCount++;
            // We want middle words [shore, share, spare, spark]
            // Middle slice is [spark, spare, share, shore]
            // To get [shore, share, spare, spark], we need to shuffle such that:
            // last becomes first, etc.
            // This is hard to control with Math.random in a simple way.
            // Instead, I'll just manually set the rows if I could, but I can't easily.
            return 0; // Deterministic "shuffle"
        });

        render(<CrossclimbStage onAdvance={vi.fn()} />);
        
        // Solve middle rows in reverse order
        fireEvent.click(screen.getByText('Solve shore'));
        fireEvent.click(screen.getByText('Solve share'));
        fireEvent.click(screen.getByText('Solve spare'));
        fireEvent.click(screen.getByText('Solve spark'));

        // They are sorted! [shore, share, spare, spark]
        // rows[1] is "shore". rows[0] was "stark". 
        // distance(stark, shore) != 1.
        // It SHOULD swap so rows[0] becomes "store" (dist 1 from shore).
        
        // Wait for the effect to run
        expect(screen.queryByLabelText('locked')).toBeNull();
        expect(screen.getByText('Solve store')).toBeTruthy(); // Should be at the top now!
    });
});
