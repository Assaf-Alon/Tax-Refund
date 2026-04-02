# Leaderboard Stage for LinkedIn Games

This document outlines the design and implementation of the post-game leaderboard stage for the LinkedIn-themed riddles.

## 1. Goal
Create a reusable `LeaderboardStage` component that provides a high-fidelity, "premium" transition between mini-games, highlighting the user's performance relative to placeholder competitors.

## 2. Approach
The leaderboard will fetch the user's completion time for the current game and display a ranked list. To maintain a positive "executive" feel, the user will always be placed in **2nd place**, just behind a slightly faster competitor.

### Alternatives Considered
- **Global Leaderboard**: Rejected due to session-based nature of current app and no backend requirement.
- **Dynamic Placement**: Rejected to ensure a consistent specific user experience where they feel challenged but successful ("silver medal" status).

## 3. Implementation Details

### Step 1: Timing Measurement
Each game stage (`CrossclimbStage`, `PinpointStage`, `QueensStage`) must measure the time elapsed from mount to completion.

```tsx
// Pattern for each game component:
const [startTime] = useState(Date.now());

const handleComplete = () => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    onAdvance(elapsedSeconds); // Pass time to parent
};
```

### Step 2: State Flow in LinkedInGames.tsx
To show the leaderboard without breaking the `ProgressHUD` counter, use a local `isShowingLeaderboard` flag.

- **State Management**:
    - `userTimes`: `Record<string, number>` (e.g., `{ 'crossclimb': 45.2, 'pinpoint': 12.8 }`)
    - `isShowingLeaderboard`: `boolean`
- **Logic**:
    1. Game calls `onAdvance(time)`.
    2. `LinkedInGames` saves `time` to `userTimes` and sets `isShowingLeaderboard = true`.
    3. `renderStage` displays `LeaderboardStage` if flag is true; otherwise displays the current `stage` component.
    4. "Play Next" button on leaderboard calls `handleNext()`, which sets `isShowingLeaderboard = false` and calls the original `handleAdvance()`.

### Step 3: Leaderboard Logic
- **Component Props**:
    - `gameName: string`
    - `userTime: number`
    - `onNext: () => void`
- **Placeholder Generation**:
    - 1st Place: `User Time * 0.85`
    - 3rd Place: `User Time * 1.2`
    - 4th Place: `User Time * 1.5`
- **Avatar Silhouette**: Use a circular SVG placeholder with a head silhouette.

### Step 4: Data Persistence (gameState.ts)
Update `src/shared/logic/gameState.ts` to support storing metrics:
```typescript
interface GameState {
    // ...
    riddleMetrics: Record<string, Record<string, number>>; // riddleId -> gameKey -> seconds
}
```

## 4. UI/UX (Premium LinkedIn Aesthetic)
- **Background**: `#f3f2ef` (Light) / `#1d2226` (Dark)
- **Cards**: White with subtle borders (`#e0e0e0`) and `rounded-xl`.
- **Medals**: Gold, Silver, Bronze SVG icons for top 3.
- **Animations**: Use `framer-motion` or Tailwind `animate-in` for a staggered list entry.
- **Typography**: Sans-serif (Inter/system), bold headers.

## 5. Verification
- **Manual Verification**: Play through Crossclimb; verify the leaderboard appears with the exact captured timing and "2nd place" rank.
- **Visual Audit**: Confirm the styling matches the provided hex codes and feels "premium".
- **State Audit**: Refresh the page while on the leaderboard; it should persist (if using metrics storage).
- **Responsive Test**: Verify "Play Next" is reachable on small mobile screens without scrolling.
