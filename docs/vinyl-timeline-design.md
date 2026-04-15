# Design Doc: The Vinyl Timeline (Music Guesser)

## 1. What is being changed/added
A new premium music-guessing feature "The Vinyl Timeline" is being added. This is a significant addition that includes:
- A custom vertical drag-and-drop timeline.
- A logic-heavy game engine supporting multiple modes (Survivor, Points).
- A robust YouTube IFrame API bridge for audio snippets.
- Local multiplayer "Pass-and-Play" support.
- Integration with the Admin Dashboard for quick access and management.
- A physical-to-digital bridge via QR code scanning.

## 2. Why this approach?
- **Premium Aesthetics**: The "Record Store" theme creates a distinct, high-end "collectible" feel using glassmorphism, 3D CSS transforms, and dark-mode gradients.
- **Vertical-First UX**: Scrolling through a timeline vertically is the most natural interaction on mobile devices, which are the primary target for this game.
- **YouTube API**: Minimizes technical debt by using existing data without needing a custom audio hosting solution.
- **Modular Game Loop**: Logic is decoupled from UI, allowing for future "MP3 mode" or "Spotify mode" with minimal changes.

## 3. How it will be implemented

### A. Pre-implementation Refactor
Before building the game, clean up existing technical debt to enable reuse:
1. **Shared Types**: Move `SongItem` from `QuizClipTrimmer.tsx` to `@/shared/types/music.ts`.
2. **Shared Hook**: Extract YouTube IFrame logic from `QuizClipTrimmer.tsx` into `src/shared/hooks/useYoutubePlayer.ts`.
   - The hook should manage the `onYouTubeIframeAPIReady` global callback once.
   - It should expose `playExcerpt(id, start, duration)` and `stop()`.

### B. Core Architecture
Located in `src/features/vinyl-timeline/`.
- `VinylTimelinePage.tsx`: The orchestrator (Public route: `/vinyl`).
- `hooks/useVinylGame.ts`: The "Brain" (State machine & multiplayer logic).
- `hooks/useYoutubePlayer.ts`: The "Voice" (Reused/extracted from shared hooks).
- `components/`: Pure UI components (VinylCard, Timeline, PlayerUI, Scanner).

### C. Game Logic Engine (`useVinylGame.ts`)
Manages a rigorous state machine:
1. **Setup**:
   - **Player Entry**: A pre-game screen to enter player names (defaults to "Player 1", "Player 2" if left blank).
   - **Data**: Loads `anime_songs.json`, filters `status === 'completed'`.
   - **Persistence**: Game state (current players, scores, timeline) should be persisted in `localStorage` under `vinyl_game_state` to survive accidental refreshes.
   - **Anchor**: Selects an "Anchor Year" (median of the current pool ± 2 years).
2. **The Loop**:
   - **Shuffle**: Picks the next mystery song.
   - **Listen**: Controls the "One Listen Only" lock (optional per mode). Displays a **Progress Bar** synced with the YouTube currentTime.
   - **Place**: Validates index `i` in `timeline`. 
     - *Rule*: `timeline[i-1].year <= mystery.year <= timeline[i].year`.
     - *Tie-Breaker*: If years are equal, it is valid as long as it's adjacent to the same year.
   - **Reveal**: Triggers the 3D flip animation. The card back features a blurred, low-opacity (20%) version of the YouTube thumbnail.
3. **Multiplayer**:
   - `players`: Array of `{ name: string, score: number, lives: number }`.
   - `currentPlayerIndex`: Rotates after each placement or round end.

### D. UI/UX Details
1. **Vertical Timeline (`Timeline.tsx`)**:
   - Uses `@dnd-kit/core`.
   - **Drop Targets**: Instead of large containers, use small, glowing "+" lines between existing records.
   - **Logic**: Dropping an item has an `id` matching the mystery card. `over.id` should be `drop-point-${index}`.
2. **Vinyl Card (`VinylCard.tsx`)**:
   - **3D Flip**: Controlled via `isRevealed` prop with `perspective: 1000px` and `transform-style: preserve-3d`.
   - **Record Animation**: Use a Lucide `Disc` icon or a custom SVG with a CSS `animate-spin-slow` (linear, infinite) when audio is playing.
   - **Flicker**: Subtle "Vinyl Noise" overlay using a grain texture with a low-opacity flicker animation (`opacity: 0.03 -> 0.08`).
3. **PlayerControl (`components/PlayerUI.tsx`)**:
   - Displays current player's name and score.
   - **Progress Bar**: An SVG or Div-based progress bar (e.g., `scaleX` transform) that fills over the duration of the snippet.

### E. Integration & Routing
- **Public Route**: `/vinyl` - The main game entry point.
- **Direct Play Route**: `/vinyl/play/:id` - Launches game with a specific item as the first mystery.
- **Admin Access**: Link added to `src/features/admin/AdminDashboard.tsx` under "Admin Tools" for quick testing.

## 4. Verification

### Automated
- **Logic Tests**: `checkPlacement(timeline, song, targetIndex)` unit tests covering:
  - Empty timeline (except anchor).
  - Exact year matches.
  - Successive placements.
- **Data Filtering**: Ensure `pending` status songs never leak into the pool.

### Manual Behavior
- **Mobile responsiveness**: Verify the vertical layout doesn't overflow or glitch when the timeline grows to 10+ items.
- **Pass-and-Play UX**: Ensure the "Player Reveal" screens are clear enough for users to hand over their phones.
- **Broken Links**: Test the "Skip/Report" flow by manually injecting a dead YouTube ID.
- **State Recovery**: Start a game, refresh the page, and ensure the scores and timeline persist.
