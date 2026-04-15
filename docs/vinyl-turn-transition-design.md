# Design Doc: Vinyl Timeline Turn Transition Overlay

## 1. What is being changed/added
We are adding a "Pass-and-Play" transition screen to multiplayer games.
1.  **Handover Screen**: A full-screen overlay that appears between turns.
2.  **Purpose**: Ensures the device is handed over correctly and the next player is ready before the song starts playing.

## 2. Why this approach?
- In local multiplayer, the "Next Turn" button currently starts the next song immediately. This can be jarring if the phone is being passed.
- A dedicated screen like "Pass the device to [Name]" creates a clear break and prevents accidental spoilers or missed audio starts.

## 3. How it will be implemented

### A. UI State (`VinylTimelinePage.tsx`)
*   Add a local state `showHandoverOverlay: boolean` and `pendingNextPlayer: Player | null`.
*   In the Result Modal's "Next Turn" button:
    *   If `players.length > 1`: 
        *   Find the next player.
        *   Show the handover overlay instead of calling `proceedToNextPlayer` immediately.
    *   Else: Just proceed.
*   Handover Overlay Components:
    *   Background: Dark, blurred (`bg-black/90`).
    *   Title: "Handover!".
    *   Message: "Please pass the device to **[Name]**".
    *   Button: "I am [Name] - Let's Go!".

### B. Visual Polish
*   Use a large scale-up animation for the next player's name.
*   Add a subtle "Waiting" pulse effect.

## 4. Verification
- Start a 2-player game.
- Finish turn 1 -> Click Next Turn.
- Confirm handover overlay appears.
- Click "I am [Name]" -> Confirm turn 2 starts.
