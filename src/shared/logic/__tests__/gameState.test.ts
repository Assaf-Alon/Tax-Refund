// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';
import {
    loadState,
    updateRiddleProgress,
    getRiddleProgress,
    resetRiddleProgress,
    resetAllProgress,
    setRiddleProgress,
    updateAdminSettings,
} from '../gameState';

describe('gameState', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('getRiddleProgress', () => {
        it('returns 0 for an unknown riddle', () => {
            expect(getRiddleProgress('nonexistent')).toBe(0);
        });

        it('returns the saved stage for a known riddle', () => {
            updateRiddleProgress('the-cave', 2);
            expect(getRiddleProgress('the-cave')).toBe(2);
        });
    });

    describe('updateRiddleProgress', () => {
        it('sets the correct stage and persists to localStorage', () => {
            updateRiddleProgress('the-cave', 3);
            const state = loadState();
            expect(state.riddleProgress['the-cave']).toBe(3);
        });

        it('does not affect other riddles', () => {
            updateRiddleProgress('the-cave', 1);
            updateRiddleProgress('the-forest', 2);
            expect(getRiddleProgress('the-cave')).toBe(1);
            expect(getRiddleProgress('the-forest')).toBe(2);
        });
    });

    describe('setRiddleProgress', () => {
        it('jumps a riddle to an arbitrary stage', () => {
            setRiddleProgress('the-cave', 3);
            expect(getRiddleProgress('the-cave')).toBe(3);
        });

        it('overwrites the previous stage', () => {
            setRiddleProgress('the-cave', 1);
            setRiddleProgress('the-cave', 3);
            expect(getRiddleProgress('the-cave')).toBe(3);
        });
    });

    describe('resetRiddleProgress', () => {
        it('removes progress for a single riddle', () => {
            updateRiddleProgress('the-cave', 3);
            updateRiddleProgress('the-forest', 2);

            resetRiddleProgress('the-cave');

            expect(getRiddleProgress('the-cave')).toBe(0);
            expect(getRiddleProgress('the-forest')).toBe(2);
        });

        it('is a no-op for riddles that have no progress', () => {
            resetRiddleProgress('nonexistent');
            const state = loadState();
            expect(state.riddleProgress).toEqual({});
        });
    });

    describe('resetAllProgress', () => {
        it('clears all progress including inventory', () => {
            updateRiddleProgress('the-cave', 3);
            updateRiddleProgress('the-forest', 1);

            resetAllProgress();

            const state = loadState();
            expect(state.riddleProgress).toEqual({});
            expect(state.inventory).toEqual([]);
        });

        it('returns default state after reset', () => {
            updateRiddleProgress('the-cave', 2);
            resetAllProgress();

            expect(getRiddleProgress('the-cave')).toBe(0);
        });
    });

    describe('updateAdminSettings', () => {
        it('updates admin settings and persists them', () => {
            updateAdminSettings({ bypassPinOnLocalhost: false });
            const state = loadState();
            expect(state.adminSettings.bypassPinOnLocalhost).toBe(false);
        });

        it('merges settings correctly', () => {
            updateAdminSettings({ bypassPinOnLocalhost: false });
            updateAdminSettings({}); // should keep existing
            expect(loadState().adminSettings.bypassPinOnLocalhost).toBe(false);
        });
    });
});
