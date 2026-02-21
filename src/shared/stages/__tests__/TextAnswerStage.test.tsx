// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TextAnswerStage } from '../TextAnswerStage';
import * as fuzzyMatch from '../../logic/fuzzyMatch';

vi.mock('../../logic/fuzzyMatch', () => ({
    isCloseEnough: vi.fn(),
}));

describe('TextAnswerStage', () => {
    afterEach(() => {
        cleanup();
    });
    it('renders title and prompt', () => {
        render(
            <TextAnswerStage
                title="Test Title"
                prompt="Test Prompt"
                acceptedAnswers={['answer']}
                onAdvance={vi.fn()}
            />
        );
        expect(screen.getByText('Test Title')).toBeTruthy();
        expect(screen.getByText('Test Prompt')).toBeTruthy();
    });

    it('calls onAdvance on correct answer', () => {
        vi.mocked(fuzzyMatch.isCloseEnough).mockReturnValue(true);
        const onAdvance = vi.fn();
        render(
            <TextAnswerStage
                title="Title"
                prompt="Prompt"
                acceptedAnswers={['yes']}
                onAdvance={onAdvance}
            />
        );

        const input = screen.getByPlaceholderText('Answer...');
        fireEvent.change(input, { target: { value: 'yes' } });

        const button = screen.getByText('Answer');
        fireEvent.click(button);

        expect(onAdvance).toHaveBeenCalled();
    });

    it('shows error message on incorrect answer', () => {
        vi.mocked(fuzzyMatch.isCloseEnough).mockReturnValue(false);
        const onAdvance = vi.fn();
        render(
            <TextAnswerStage
                title="Title"
                prompt="Prompt"
                acceptedAnswers={['yes']}
                onAdvance={onAdvance}
                errorMessage="Wrong!"
            />
        );

        const button = screen.getByText('Answer');
        fireEvent.click(button);

        expect(screen.getByText('Wrong!')).toBeTruthy();
        expect(onAdvance).not.toHaveBeenCalled();
    });
});
