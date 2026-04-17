# Design Doc: Herzliya Park Music Riddle

## 1. What is being changed?
Addition of a new interactive riddle feature: **"Herzliya Park Music Hunt"**.
This feature repurposes the **Vinyl Timeline** game engine into a multi-stage scavenger hunt. Players must identify songs and sort them chronologically to reveal "Key Words" (Artist/Song/Anime names). These words are then used in conjunction with a physical "Decyphering Sheet" to find the next location in the park.

## 2. Why this approach?
### Context
The goal is to provide a premium, location-aware experience in Herzliya Park. The user requires a system that is robust against physical marker failure (vandals/weather) while maintaining a high "Aha!" factor.

### Alternatives Considered
- **Pure Digital (Everything in App)**: Rejected. It reduces the "Scavenger Hunt" vibe to a simple mobile game, losing the connection to the physical park.
- **Pure Physical (Worksheets)**: Rejected. Sorting 11 songs (Stage 3) manually on paper without verification is extremely error-prone and can lead to dead-ends.

### Chosen Approach: "The Hybrid Decoder" (Refined Idea 0)
- **Digital Component**: The app handles audio playback, sorting verification, and the "Reveal" of key metadata once sorted.
- **Physical Component**: A physical paper handout provides the "Extraction Rules" (e.g., "Take the 1st letter of the 3rd oldest song's Artist").
- **Benefit**: The app acts as a "Gatekeeper" to ensure the player has the right order before they try to decode the paper, preventing frustration while keeping the final solution tactile.

## 3. How will it be implemented?

### Directory Structure
```text
src/features/riddles/herzliya-park/
├── assets/             # Themed assets (logos, background music)
├── components/         
│   ├── TimelineRiddle.tsx   # Reusable sorting component
│   └── SongIdentifyModal.tsx # "Confidence Check" UI
├── data/
│   └── stages.ts       # Definitions for the 5 stages
├── theme.ts            # Centralized styling
└── HerzliyaParkRiddle.tsx # Main Entry Point
```

### Data Schema (`data/stages.ts`)
Each stage will define:
- `songIds`: Array of IDs from the main `songs.json`.
- `revealWords`: The specific word to show upon success (e.g., "Bakuman" or "Rick Astley").
- `targetLocationHint`: A cryptic hint for the destination.
- `extractionPattern`: Metadata describing which letter to take (for dev reference/hint system).

### Core Components & Logic

#### `TimelineRiddle.tsx`
This will be a specialized, "Riddle-Mode" version of the `VinylTimeline`.
- **Initial State**: Records are shown with generic labels ("Song 1", "Song 2").
- **Identifying**: Tapping a record allows the user to type a guess. Correct guesses add a "Verified" badge.
- **Sorting**: Standard drag-and-drop.
- **Validation**:
    - A "Check Order" button validates the sequence against the release years.
    - **Reveal**: On success, the labels animate to reveal the `revealWords`.

#### `HerzliyaParkRiddle.tsx` (The Engine)
- Uses `shared/logic/gameState.ts` to persist progress (`updateRiddleProgress`).
- Manages the transition between the 5 stages:
    1. **Stage 0**: Tutorial (Hebrew songs spelling "ר-מ-ז").
    2. **Stage 1 (To Lake)**: 4 Anime songs. (L-A-K-E)
    3. **Stage 2 (To Train)**: 5 Popular songs. (T-R-A-I-N)
    4. **Stage 3 (To Bench)**: 11 Anime songs. (L-O-V-E-R-S-B-E-N-C-H)
    5. **Stage 4 (To Hill)**: 4 Songs with match-location logic. (H-I-L-L)

### Physical Handout Generation
I will provide a separate script or markdown file that generates the text for the physical handout, ensuring the indices match the `data/stages.ts` definitions perfectly.

## 4. Verification
- **Unit Tests**: Ensure the `isSortedCorrect()` logic handles songs from the same year (if any) gracefully.
- **Manual QA**:
    - Verify that "Reveal Words" stay hidden until a correct sort is achieved.
    - Verify that refreshing the browser mid-stage restores the "Verified" status of identified songs.
    - Verify mobile responsiveness (touch targets for dragging on small screens).
- **Edge Cases**: Verify behavior if the user hasn't "Identified" all songs but gets the order right (the Reveal should still work).
