# Multi-Category Support for Vinyl Timeline

This document outlines the changes needed to support multiple song categories (Anime, Popular, Custom) in the Vinyl Timeline mini-game, allowing players to choose which categories to include in their game.

## 1. What is being changed/added

-   **Data Structure**: Adding a `category` field to the `SongItem` interface.
-   **Admin Tool (QuizClipTrimmer)**:
    -   Adding a "Bulk Add" feature to allow pasting song lists directly from spreadsheets.
    -   Allowing per-song category editing.
    -   Supporting bulk category assignment for imported songs.
-   **Game Logic (`useVinylGame` hook)**:
    -   Filtering the song pool based on user-selected categories during setup.
    -   Dynamically identifying available categories from the dataset.
-   **UI (VinylTimelinePage)**:
    -   Adding a category selection interface in the "Setup Game" screen.
    -   Visual indicators for song categories (optional, but helpful).

## 2. Why this approach?

-   **Flexibility**: A single JSON file with a `category` field is more flexible than separate files. It allows for easy filtering and potential "mix and match" without complex file management.
-   **Admin Efficiency**: The user mentioned having songs in a Google Sheet. Manually adding them one by one is tedious. A bulk-paste tool that parses common spreadsheet formats (TAB-separated or CSV-like) will save significant time.
-   **User Control**: Allowing players to "pick and choose" categories makes the game more versatile for different audiences (e.g., mainstream vs. niche).

### Alternatives considered:
-   **Separate JSON files**: Rejected because it complicates the loading logic and makes it harder to support songs that might belong to multiple categories (though we are using a single category for now).
-   **Manual entry only**: Rejected because the user explicitly mentioned having a Google Sheet and wanting to add "more songs", implying a need for scale.

## 3. Implementation Plan

### Phase 1: Shared Types & Data
1.  Update `src/shared/types/music.ts` to add `category?: string` to `SongItem`.
2.  Update `public/data/anime_songs.json` to include `"category": "Anime"` for existing songs.

### Phase 2: Admin Tool Enhancements (`QuizClipTrimmer.tsx`)
1.  **Category Input**: Add a `category` field to the `Edit Metadata` modal and the `saveCurrentProgress` logic.
2.  **Bulk Add Feature**:
    -   **Parser**: Implement a robust parser for the specific TAB-separated schema:
        `Artist | Song | Year | Start1 | End1 | StartAlt | EndAlt | Type | YT Link | Notes`
    -   **Name Mapping**: Combine `Artist` and `Song` into the `name` field (e.g., "Rick Astley - Never Gonna Give You Up").
    -   **Validation**: Handle missing YouTube links (set to empty) and missing times (default to 0-10 if needed).
    -   **State Integration**: Use `setSongs(prev => [...prev, ...newSongs])` to append.
3.  **Default Category Selection**: Add a dropdown in the UI to set the "Current Session Category" so all newly added/imported songs get it automatically.

### Phase 3: Game Logic (`useVinylGame.ts`)
1.  Update `VinylGameState` to include `selectedCategories: string[]`.
2.  Update `setupGame` to accept `selectedCategories`.
3.  Modify `prepareInitialSongs` and `setupGame` to filter the `pool` based on `selectedCategories`.

### Phase 4: Setup UI (`VinylTimelinePage.tsx`)
1.  In `renderSetup`, add a section for "Song Categories".
2.  Fetch all available categories from the loaded song data.
3.  Render them as toggleable chips/buttons.
4.  Persist the selection in `localStorage` via the game state.

## 4. Verification

-   **Trimmer**: Test pasting 5-10 songs from a spreadsheet and verify they appear in the playlist with correct metadata.
-   **Filtering**: Start a game with only the "Custom" category selected and verify that only those songs appear in the game.
-   **Sanity**: Ensure "Anime" songs still work as expected.
-   **Persistence**: Refresh the page during setup and verify that selected categories are remembered.
