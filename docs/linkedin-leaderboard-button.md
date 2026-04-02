# Design: LinkedIn Games Final Leaderboard Button Text

This document outlines the change to customize the leaderboard's call-to-action button after the final game (Queens) in the LinkedIn Games suite.

## 1. What is being changed?
- The `LeaderboardStage` component will be updated to accept a new prop, `isLastGame`.
- The button text in `LeaderboardStage` will dynamically change from "Play Next" to a completion-focused label when `isLastGame` is true.
- `LinkedInGames.tsx` will be updated to pass the correct `isLastGame` value based on the current stage.

## 2. Why this approach?
- **Context**: Currently, the leaderboard always shows "Play Next", which is confusing after the final game as there is no next game (it leads to the congrats screen).
- **Alternatives considered**: 
    - Hardcoding the check inside `LeaderboardStage` based on `gameName`. *Rejected* as it couples the component to specific game names.
    - Creating a separate `FinalLeaderboardStage`. *Rejected* as it would duplicate most of the logic and UI of the existing leaderboard.

## 3. How it will be implemented

### `LeaderboardStage.tsx`
1. Update `LeaderboardStageProps` interface:
   ```typescript
   interface LeaderboardStageProps {
       gameName: string;
       userTime: number;
       onNext: () => void;
       isLastGame?: boolean; // New prop
   }
   ```
2. Update the button text logic:
   ```tsx
   <button ...>
       {isLastGame ? "View Final Results" : "Play Next"} <ChevronRight className="w-4 h-4" />
   </button>
   ```

### `LinkedInGames.tsx`
1. Pass the `isLastGame` prop to `LeaderboardStage`:
   ```tsx
   <LeaderboardStage 
       gameName={gameNames[stage]} 
       userTime={lastGameTime} 
       onNext={handleNextFromLeaderboard} 
       isLastGame={stage === 3} // stage 3 is Queens
   />
   ```

## 4. Proposed Button Text Options
The user requested 3 options for the final button text:
1. **"View Final Results"** (Clear and professional)
2. **"Complete Challenge"** (Action-oriented and rewarding)
3. **"See Summary"** (Concise and standard)

## 5. Verification
- **Manual Test**: Play through the full game (or use DevSkip) and verify that after Crossclimb and Pinpoint the button says "Play Next", but after Queens it shows the selected final text.
- **Visual Check**: Ensure the button layout remains consistent with the new text.
