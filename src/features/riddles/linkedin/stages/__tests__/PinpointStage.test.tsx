// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PinpointStage } from '../PinpointStage';

describe('PinpointStage', () => {
    afterEach(() => {
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
        
        const input = screen.getByPlaceholderText(/Guess the category/);
        fireEvent.change(input, { target: { value: 'wrong guess' } });
        fireEvent.submit(input); // Form submission

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

        const input = screen.getByPlaceholderText(/Guess the category/);
        fireEvent.change(input, { target: { value: 'museum' } });
        fireEvent.submit(input);

        expect(screen.getByText('Correct!')).toBeTruthy();
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

        const input = screen.getByPlaceholderText(/Guess the category/);
        fireEvent.change(input, { target: { value: 'museums' } }); // Fuzzy match for 'Museum'
        fireEvent.submit(input);

        expect(screen.getByText('Correct!')).toBeTruthy();
        expect(screen.getByText('5 of 5')).toBeTruthy();
    });
});
