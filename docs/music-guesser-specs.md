# Music Guesser Spec: "The Vinyl Timeline"

## 1. Overview (What)
"The Vinyl Timeline" is a music-based trivia game where players place songs onto a growing vertical timeline based on their release years. It features a premium, minimalist "Record Store" aesthetic with smooth 3D animations and mobile-first gameplay.

### Core Loop
1.  **Start:** The game begins with a "Year Anchor" (a plain card showing a random year in the range `[median - 2, median + 2]` of the active song pool). This card provides a temporal reference point but has no associated song.
2.  **Listen:** A snippet of a random song plays once (no replay allowed). The duration and segment depend on the selected Game Mode. YouTube errors (dead links) will trigger a "Skip" option that reveals the song metadata (Title, Artist, and Anime info if applicable) to help identify the broken entry.
3.  **Place:** The user drags the "Mystery Card" into a slot on the vertical timeline.
    *   **Up:** Represents earlier years.
    *   **Down:** Represents later years.
    *   **Interaction:** To assist with placement on small screens, a small "+" button/placeholder appears between existing vinyls as a drop target.
4.  **Reveal:** The card flips with a 3D animation **only after it is dropped** into a slot.
    *   **Correct Guess:** The card is permanently added to the vertical timeline. (Note: If a song has the same year as an adjacent card, it can be placed either before or after it).
    *   **Incorrect Guess:** The card disappears (or triggers a penalty depending on the mode).
5.  **Score & Win Conditions:** 
    *   **Points Mode:** First to reach X correctly placed songs wins. (Default: 10).
    *   **Survivor Mode:** Players start with X lives (Default: 3). Each mistake costs a life; the game ends when lives reach zero.
    *   **Multiplayer Fairness:** If a player reaches the target score, the round continues until everyone has had an equal number of turns (Final Round), allowing for potential ties or overtime.

---

## 2. Context & Rationale (Why)
*   **Minimalist Record Theme:** Chosen to give the app a premium, "collectible" feel rather than a generic trivia UI.
*   **Vertical Timeline:** Optimized for mobile one-handed use. Scrolling up (past) and down (future) is more ergonomic on portrait screens.
*   **YouTube Embed (POC):** Chosen for immediate access to a massive library using existing `youtubeId` fields in the data, avoiding high hosting/bandwidth costs for audio files.
*   **One Listen Rule:** Increases tension and rewards players with good "intro" or "hook" recognition.
*   **Future-Proofing:** While it starts with an anime song focus, the app is designed to support multiple categories (Popular, Niche, Custom) and filtering.

---

## 3. Implementation Plan (How)

### A. Data Layer
*   **Sources:** Primarily `public/data/anime_songs.json`. Designed to scale to other category-specific JSON files.
*   **Model Extension:** Songs must have a `category` field (e.g., "anime", "popular"). Only songs with `status: "completed"` are included in the active pool.

### B. Game Modes & Settings
Players can customize their session in the main menu:
1.  **Playback Modes:**
    *   **Regular Mode:** Respects the `startTime`/`endTime` or `altStartTime`/`altEndTime` from the JSON. Default snippet is ~20s.
    *   **Shuffle Mode:** Overrides the JSON start times and picks a random segment **anywhere** in the song.
    *   **Hard Mode:** Limits the playback duration to exactly **10 seconds**, regardless of whether the start time was fixed or shuffled.
2.  **Tournament Settings:**
    *   **Points vs. Survivor:** Toggle between "First to 10" and "3 Strikes and Out".
    *   **Target Score/Lives:** Configurable numeric values for the selected mode.
    *   **Local Pass-and-Play:** A banner indicates whose turn it is (supports multiple players on one device).

### C. UI Components (Mobile First)
*   **The Record Player:** A central interaction point that triggers the one-time audio stream. On mobile, this component remains sticky (pinned) to the bottom of the screen to stay accessible while the user scrolls the timeline.
*   **The Vertical Timeline:** A sortable container using `@dnd-kit`. It features dedicated "+" Drop Zones between cards for precise placement.
*   **Vinyl Card:** 
    *   **Front:** Mystery/Vinyl record graphic with a "year placeholder" icon.
    *   **Back:** Artist, Title, Year, and "Anime/Category" info.
    *   **Background:** The high-quality YouTube thumbnail (`https://img.youtube.com/vi/[id]/maxresdefault.jpg`) at 20% opacity.
    *   **Animation:** 3D CSS transition `rotateY(180deg)`.

### D. Audio Implementation (YouTube API)
*   **Player Setup:** A hidden YouTube wrapper that receives `youtubeId`, `seekTo`, and `duration`.
*   **Controls:** The UI only provides a large "Play" button. Once clicked, the button is disabled to enforce the "Only One Listen" rule.

### E. Physical Card Bridge
The app supports a hybrid physical/digital experience for users who own physical cards with QR codes.
1.  **Scanning Entry (Direct URL):** A physical card's QR code leads to `site.com/reveal/:songId`. This opens the app directly in a "Discovery State" where only that specific card is played and revealed.
2.  **In-App Scanner:** For a continuous game loop, a "Physical Mode" in the app menu opens the device camera. Scanning a card adds it to the current digital timeline session as the "Next Mystery Card." If the song is already present in the active timeline, it is skipped to avoid duplicates.

---

## 5. Future Roadmap & Stretch Goals
These features are **not** part of the initial implementation (POC) but the code should be written with these in mind (e.g., leaving `TODO` comments or using flexible interfaces).

### [STRETCH] Asset Pre-downloading
*   **Goal:** Replace YouTube embeds with locally served high-quality MP3/WebM snippets.
*   **Reason:** Faster load times, no "Autoplay" restrictions, and offline capability.

### [STRETCH] Online Multiplayer
*   **Goal:** Move beyond "Local Pass-and-Play" to real-time competition across different devices.
*   **Requirement:** Integration with a backend (e.g., Socket.io or Firebase) to sync timeline states.

### [STRETCH] Advanced Filtering & Custom Decks
*   **Goal:** Allow users to upload their own JSON "Song Decks" or filter by specific anime genres/tags.

### [STRETCH] Video Background Reveal
*   **Goal:** Instead of just a static thumbnail, the revealed card plays a 5-second looped video clip of the song's opening/ending.

---

## 6. Verification
### Automated
*   **Ordering Logic:** Unit tests to verify that `isCorrectPlacement(newCard, timeline)` correctly handles boundary years (e.g., placing 2015 between 2010 and 2020).
*   **Filtering:** Test that the song picker correctly excludes `pending` status songs.

### Manual Verification
*   **Mobile UX:** Verify drag-and-drop performance on low-end mobile devices to ensure zero lag in the vertical scroll.
*   **Audio Timing:** Use a stopwatch to confirm "Hard Mode" cuts the YouTube stream at exactly 10 seconds.
