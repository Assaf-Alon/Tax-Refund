# Design: Adding New Songs via Bulk Add

This document outlines the process for efficiently adding 114 new songs from a YouTube Music playlist to the Vinyl mini-game library.

## Goal
Add songs from [this playlist](https://music.youtube.com/playlist?list=PLJGnKCFPsNy5T8a6oNjIcIKlln1WiemGi) while:
1.  Avoiding duplicates (checking against existing `songs.json`).
2.  Pre-filling Artist, Song Name, and YouTube ID.
3.  Defaulting to "Custom" category for manual refinement to "Anime".
4.  Leveraging the existing "Bulk Add" feature in the `QuizClipTrimmer`.

## Context
The `QuizClipTrimmer` component already includes a robust `Bulk Add` feature that accepts Tab-Separated Values (TSV) in the following format:
`Artist [TAB] Song [TAB] Year [TAB] Start [TAB] End [TAB] AltStart [TAB] AltEnd [TAB] Type [TAB] YT Link [TAB] Notes`

The app also has a server-side metadata plugin that uses `yt-dlp` to automatically fetch release years when a video is loaded in the trimmer, reducing manual research.

## Proposed Workflow

### 1. Extraction and Deduplication
I have created a Python script (`scratch/fetch_playlist.py`) that:
- Uses `yt-dlp` to fetch the playlist metadata.
- Reads `public/data/songs.json` to identify existing songs (by `youtubeId`).
- Generates a TSV formatted specifically for the `QuizClipTrimmer`.
- Identifies and skips 20 duplicate songs found in the playlist.

### 2. Manual Refinement Process
Once the songs are added via the Bulk Add tool, the user will:
1.  Navigate to the Admin Trimmer.
2.  Open **Bulk Add** and paste the provided TSV.
3.  Iterate through the new "pending" songs.
4.  For each song:
    -   Click **Load** (this triggers the automatic year fetch).
    -   Verify/adjust the **Category** (Custom vs Anime).
    -   Set **Start/End** markers using the player.
    -   **Next & Save** to move to the next song.

## Implementation Details

### No Code Changes Required
The existing infrastructure is sufficient. The primary "implementation" is the generation of the data and the instructions for the user.

### Verification Plan
1.  **Script Verification**: Run the script to ensure it correctly maps the 114 new songs.
2.  **Schema Verification**: Ensure the generated TSV matches the `QuizClipTrimmer`'s expectations.
3.  **Duplicate Check**: Manually verify a few skipped songs (e.g., "KICK BACK", "勇者") are indeed in `songs.json`.

## Conclusion
This approach is the most efficient as it leverages existing high-quality tools within the codebase rather than implementing new, redundant automation for a one-time data entry task.
