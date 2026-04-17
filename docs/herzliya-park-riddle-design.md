# Design Document: Herzliya Park Vinyl Riddle

## 1. Goal
Implement a location-based scavenger hunt in Herzliya Park using the modularized Vinyl Timeline engine. The riddle adds a "Hybrid Decoder" layer where chronological song sorting reveals hidden words used with a physical deciphering sheet.

## 2. Context & Rationale
We want to evolve the "Vinyl Timeline" from a simple mini-game into a structured, narrative-driven riddle. By using the shared Vinyl components, we maintain visual consistency while introducing a new "Sequence Mode" interaction (sorting a set of cards at once).

### Alternatives Considered
- **Standard Mini-Game Integration**: Rejected because the "one-by-one" card placement doesn't lend itself well to a fixed set of "reveal words" per location.
- **Digital-only Decoder**: Rejected to encourage physical interaction and "fieldwork" in the park.

## 3. Implementation Details

### 3.1 Data Schema (`src/features/riddles/herzliya-park/data/stages.ts`)
```typescript
export interface RiddleStage {
  id: string;
  locationName: string;
  hint: string;
  songIds: number[];
  revealWords: string[]; // Words shown on the back of records once sorted (in chronological order)
}
```

### 3.2 Feature Component (`HerzliyaParkRiddle.tsx`)
- **State Management**:
  - `currentStageIndex`: Tracks progress.
  - `userOrder`: An array of `SongItem` representing the current player-defined order.
  - `isCorrect`: boolean (once chronological order is verified).
- **Sorting Logic**:
  - Use `@dnd-kit/sortable` for the sequence sorting.
  - Players drag cards to arrange them.
  - Validation: Compare `userOrder` against `vinyl-logic.ts:isChronological`.
- **Reveal Phase**:
  - When the user clicks a "Check" button AND `isChronological` is true, all cards transition to `displayMode="revealed"`.
  - The `revealWord` prop is passed to `VinylCard` from the stage data mapping.

### 3.3 Visual & Theme (`theme.ts`)
- Use a "Nature meets Tech" aesthetic (Dark Slate with Emerald/Grass Green accents).
- High-fidelity typography (Inter/Outfit).

### 3.4 Physical Decypher Sheet (The "Field Guide")
Generated as a high-fidelity artifact for the user to print. It will map "Word + Index" to letters. 
Example: "Take the 3rd letter of the word revealed on the 1990s record".

## 4. Verification Plan
1. **Logic Test**: Verify `isChronological` handles same-year songs correctly in a sequence of 4+.
2. **UX Test**: Ensure `DragOverlay` works smoothly for multiple cards on mobile.
3. **Audio Test**: Verify `useAudioStream` handles switching between multiple cards in the sorting pool (clicking a card plays its snippet).
4. **Integration**: Check state persistence via `updateRiddleProgress`.
