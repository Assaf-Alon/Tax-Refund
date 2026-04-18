# Song Library Cleanup and Refinement

## Goal
To perform a thorough, manual cleanup of the `new-songs-thorough.tsv` file, ensuring high-quality metadata, accurate anime attribution, and removal of duplicate or redundant entries.

## Why
Previous automated attempts were not thorough enough, leading to:
- Redundant titles (e.g., `Usseewa (Usseewa)`).
- Formatting issues (weird characters like `『`, `』`, `＜`, `＞`).
- Duplicate entries for the same song without distinguishing notes.
- Missing anime context for many Japanese songs.

Applying human-like judgment is necessary to ensure the song library is premium and professional.

## How
The cleanup will be performed in batches of 10 songs to maintain focus and quality. For each song:
1.  **Metadata Correction**:
    - Remove redundant parentheticals in titles.
    - Clean up non-standard characters (e.g., replace `『`, `』` with standard quotes or remove them).
    - Ensure artist names are consistent and accurate.
2.  **Anime Attribution**:
    - Research if the song is an opening (OP), ending (ED), or insert song for an anime.
    - If it is an anime song, update the "Type" to `Anime` and add the anime title + role (OP/ED) to the "Notes" column.
3.  **Deduplication**:
    - If a song appears twice, either keep the best version (better audio/video quality) or distinguish them in the title/notes (e.g., "English Version" vs "Japanese Version", or "Original" vs "Cover").
4.  **Formatting**:
    - Ensure the TSV structure remains intact.

## Verification
- Manual inspection of the final `new-songs-thorough.tsv`.
- Ensuring no duplicates remain unless explicitly distinguished.
- Ensuring all Japanese songs have their anime context checked.
