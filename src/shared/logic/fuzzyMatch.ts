/**
 * Compute character histogram similarity between two strings.
 * Returns a value between 0 and 1.
 * At 1.0, both strings have identical character frequency distributions.
 */
export function histogramSimilarity(a: string, b: string): number {
    const freqA: Record<string, number> = {};
    const freqB: Record<string, number> = {};

    for (const ch of a) freqA[ch] = (freqA[ch] || 0) + 1;
    for (const ch of b) freqB[ch] = (freqB[ch] || 0) + 1;

    const allChars = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
    let shared = 0;
    let total = 0;

    for (const ch of allChars) {
        const countA = freqA[ch] || 0;
        const countB = freqB[ch] || 0;
        shared += Math.min(countA, countB);
        total += Math.max(countA, countB);
    }

    return total === 0 ? 0 : shared / total;
}

const DEFAULT_THRESHOLD = 0.6;

/**
 * Check if the input is close enough to any of the accepted answers.
 * First checks for exact match (after normalization), then falls back
 * to histogram similarity.
 */
export function isCloseEnough(
    input: string,
    acceptedAnswers: string[],
    threshold: number = DEFAULT_THRESHOLD,
): boolean {
    const normalized = input.toLowerCase().trim();

    // Exact match
    if (acceptedAnswers.includes(normalized)) return true;

    // Fuzzy match against each accepted answer
    return acceptedAnswers.some(
        answer => histogramSimilarity(normalized, answer) >= threshold,
    );
}
