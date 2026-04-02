// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PinpointStage } from '../PinpointStage';

describe('PinpointStage', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        cleanup();
    });

    const clues = ['tiger', 'spy', 'museum', 'history', 'prague'];
    const correctAnswer = 'Museum';

    it('renders all 5 slots initially, with only the first revealed', () => {
        render(
            <PinpointStage
                clues={clues}
                acceptedAnswers={[correctAnswer]}
                onAdvance={vi.fn()}
            />
        );
        
        // Check for displayed clue
        expect(screen.getByText('tiger')).toBeTruthy();
        
        // Check for placeholders
        expect(screen.getByText('CLUE 2')).toBeTruthy();
        expect(screen.getByText('CLUE 3')).toBeTruthy();
        expect(screen.getByText('CLUE 4')).toBeTruthy();
        expect(screen.getByText('CLUE 5')).toBeTruthy();
        
        // Check for instruction text
        expect(screen.getByText(/All 5 clues belong to a common category/)).toBeTruthy();
        
        // Check for counter
        expect(screen.getByText('1 of 5')).toBeTruthy();
    });

    it('reveals next clue on incorrect guess', () => {
        render(
            <PinpointStage
                clues={clues}
                acceptedAnswers={[correctAnswer]}
                onAdvance={vi.fn()}
            />
        );
        
        // Type "WRONG"
        fireEvent.click(screen.getByText('W'));
        fireEvent.click(screen.getByText('R'));
        fireEvent.click(screen.getByText('O'));
        fireEvent.click(screen.getByText('N'));
        fireEvent.click(screen.getByText('G'));
        fireEvent.click(screen.getByText('ENTER'));

        expect(screen.getByText('spy')).toBeTruthy();
        expect(screen.getByText('2 of 5')).toBeTruthy();
    });

    it('accepts correct answer (case-insensitive) and reveals all clues', () => {
        const onAdvance = vi.fn();
        render(
            <PinpointStage
                clues={clues}
                acceptedAnswers={[correctAnswer]}
                onAdvance={onAdvance}
            />
        );

        // Type "MUSEUM"
        ['M', 'U', 'S', 'E', 'U', 'M', 'ENTER'].forEach(k => {
            fireEvent.click(screen.getByText(k));
        });

        expect(screen.getByText('Correct!')).toBeTruthy();
        
        // Wait for onAdvance delay
        vi.advanceTimersByTime(2000);
        expect(onAdvance).toHaveBeenCalled();
        
        expect(screen.getByText('5 of 5')).toBeTruthy();
        
        // All clues should be visible
        clues.forEach(clue => {
            expect(screen.getByText(clue)).toBeTruthy();
        });
    });

    it('accepts fuzzy matches (e.g. plural)', () => {
        const onAdvance = vi.fn();
        render(
            <PinpointStage
                clues={clues}
                acceptedAnswers={[correctAnswer]}
                onAdvance={onAdvance}
            />
        );

        // Type "MUSEUMS"
        ['M', 'U', 'S', 'E', 'U', 'M', 'S', 'ENTER'].forEach(k => {
            fireEvent.click(screen.getByText(k));
        });

        expect(screen.getByText('Correct!')).toBeTruthy();
        
        vi.advanceTimersByTime(2000);
        expect(onAdvance).toHaveBeenCalled();
        expect(screen.getByText('5 of 5')).toBeTruthy();
    });
});
