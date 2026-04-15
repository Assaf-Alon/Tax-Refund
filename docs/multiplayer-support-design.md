# Vinyl Timeline Multiplayer Support Design

This document outlines the addition of full multiplayer support for the Vinyl Timeline game, enabling multiple users to play on the same device.

## 1. What is being changed?

1.  **Dynamic Setup Screen**: Addition of "Add Player" and "Remove Player" controls to the setup screen.
2.  **Player Management Logic**: Updating the local state in the setup screen to handle an array of player names dynamically.
3.  **Active Player Visibility**: Enhancing the game HUD to make it extremely clear whose turn it is.
4.  **Turn Transition UX**: Improving the "Next Turn" overlay to specifically announce the next player's name.

## 2. Why this approach? (Rationale)

- **Rationale**: The game is naturally social. While the engine already supports multiple players, the UI was restricted to a single input. Allowing dynamic player addition makes the game accessible for groups.
- **Rationale (HUD)**: In a multiplayer setting, players can easily lose track of the turn order. Using clear typography and player-specific indicators in the HUD reduces confusion.

## 3. How it will be implemented

### 3.1 `VinylTimelinePage.tsx` Updates
1.  **State**: Keep `playerNames: string[]`.
2.  **Handlers**:
    - `addPlayer()`: Appends an empty string to `playerNames`.
    - `removePlayer(index)`: Removes a player from the array (minimum 1).
3.  **UI Updates**:
    - Add a "Plus" button below the player inputs.
    - Add a "Trash" icon next to each player input (visible if > 1).
    - Update the `renderPlaying` HUD to use larger text for the current player's name.

### 3.2 `useVinylGame.ts` Updates
- **Note**: The engine already handles player cycling and skipping dead players. No major changes expected here, but we will ensure the `players` array passed from the setup screen is cleaned (trimmed and non-empty).

## 4. Verification

1.  **Setup Addition**: Add 3 players -> Confirm 3 inputs appear.
2.  **Setup Removal**: Add a player -> Click remove -> Confirm only 1 input remains.
3.  **Turn Cycling**: Player 1 places card -> "Next Turn" (Player 2) appears -> Confirm HUD updates to Player 2 after transition.
4.  **Elimination**: Player 1 loses all lives -> Confirm Player 1 is skipped in future turns.
