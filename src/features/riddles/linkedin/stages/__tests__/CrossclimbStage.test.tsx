// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { CrossclimbStage } from '../CrossclimbStage';

vi.mock('../../../../shared/ui/CharacterInput', () => ({
    CharacterInput: ({ onComplete, expectedValue }: { onComplete: () => void, expectedValue: string }) => (
        <div>
            <button onClick={onComplete}>Complete {expectedValue}</button>
        </div>
    ),
}));

describe('CrossclimbStage', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders clues', () => {
        render(
            <CrossclimbStage
                onAdvance={vi.fn()}
            />
        );
        // "the company" is the clue for Row 1 and Row 5
        expect(screen.getAllByText(/"the company"/)).toBeTruthy();
        expect(screen.getByText(/full "____" engineer/)).toBeTruthy();
        expect(screen.getByText(/game theory/)).toBeTruthy();
        expect(screen.getByText(/equity/)).toBeTruthy();
    });

    it('locks top and bottom initially, unlocks them when middle is solved', () => {
        render(
            <CrossclimbStage
                onAdvance={vi.fn()}
            />
        );

        // Initially top and bottom show lock icon, middle show buttons
        expect(screen.getAllByText('🔒')).toHaveLength(2);
        
        // Find buttons to solve middle rows
        const middle1 = screen.getByText('Complete stack');
        const middle2 = screen.getByText('Complete stick');
        const middle3 = screen.getByText('Complete stock');

        // Solve middle ones
        middle1.click();
        middle2.click();
        middle3.click();

        // Now top and bottom should show 'Complete stark' and 'Complete stuck' buttons (unlocked)
        expect(screen.queryByText('🔒')).toBeNull();
        expect(screen.getByText('Complete stark')).toBeTruthy();
        expect(screen.getByText('Complete stuck')).toBeTruthy();
    });
});
