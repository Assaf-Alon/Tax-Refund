// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { histogramSimilarity, isCloseEnough } from '../fuzzyMatch';

describe('histogramSimilarity', () => {
    it('returns 1.0 for identical strings', () => {
        expect(histogramSimilarity('karmelita', 'karmelita')).toBe(1);
    });

    it('returns 0 for completely disjoint strings', () => {
        expect(histogramSimilarity('abc', 'xyz')).toBe(0);
    });

    it('returns 0 for empty vs non-empty string', () => {
        expect(histogramSimilarity('', 'abc')).toBe(0);
    });

    it('returns 0 for two empty strings', () => {
        expect(histogramSimilarity('', '')).toBe(0);
    });

    it('returns value between 0 and 1 for partially overlapping strings', () => {
        const sim = histogramSimilarity('karmelita', 'karmelyta');
        expect(sim).toBeGreaterThan(0);
        expect(sim).toBeLessThan(1);
    });

    it('returns high similarity for close typos', () => {
        // 'karmelita' vs 'karmelyta' — only one char differs
        const sim = histogramSimilarity('karmelita', 'karmelyta');
        expect(sim).toBeGreaterThanOrEqual(0.6);
    });

    it('returns 0 for single-character disjoint strings (e.g. "3" vs "4")', () => {
        expect(histogramSimilarity('3', '4')).toBe(0);
    });
});

describe('isCloseEnough', () => {
    it('returns true for exact match', () => {
        expect(isCloseEnough('3', ['3'])).toBe(true);
    });

    it('returns true for exact match case-insensitive', () => {
        expect(isCloseEnough('Karmelita', ['karmelita'])).toBe(true);
    });

    it('returns true for exact match with whitespace', () => {
        expect(isCloseEnough('  karmelita  ', ['karmelita'])).toBe(true);
    });

    it('returns true for close typo ("karmelyta" for "karmelita")', () => {
        expect(isCloseEnough('karmelyta', ['karmelita'])).toBe(true);
    });

    it('returns false for completely wrong input', () => {
        expect(isCloseEnough('pizza', ['karmelita'])).toBe(false);
    });

    it('returns false for wrong single-character answer ("4" for "3")', () => {
        expect(isCloseEnough('4', ['3'])).toBe(false);
    });

    it('returns true when any accepted answer matches', () => {
        expect(isCloseEnough('slab', ['the slab', 'slab'])).toBe(true);
    });

    it('returns true for fuzzy match against any accepted answer', () => {
        expect(
            isCloseEnough('skarrsinger karmelyta', ['skarrsinger karmelita', 'karmelita']),
        ).toBe(true);
    });

    it('respects custom threshold', () => {
        // With high threshold, a minor typo should fail
        expect(isCloseEnough('karmelyta', ['karmelita'], 0.99)).toBe(false);
        // With low threshold, almost anything matches
        expect(isCloseEnough('karmelyta', ['karmelita'], 0.5)).toBe(true);
    });
});
