# Design: Pinpoint UI Redesign

This document details the redesign of the Pinpoint game to match the LinkedIn Games experience as shown in the provided mockup.

## 1. What is being changed
- **Clue Slots**: Always render 5 slots with a fixed top-to-bottom blue gradient.
- **Unrevealed State**: Slots that are not yet revealed will show "CLUE 2", "CLUE 3", etc., in a centered, bold format.
- **Revealed State**: Slots will show the actual clue text.
- **Instruction Box**: A new persistent instruction box below the clues: *"All 5 clues belong to a common category. Guess the category in as few clue reveals as possible."*
- **Input Area**: A clean input field with a pill-shaped "X of 5" counter on the far right.

## 2. Why this approach was chosen
This matches the specific visual requirements provided in the user's mockup, ensuring a premium "LinkedIn-like" feel with clear progression and instructions.

## 3. How it will be implemented

### Component: `PinpointStage.tsx`
- **Color Palette**:
    1. `#a8caff` (Lightest)
    2. `#90baff`
    3. `#78aaff`
    4. `#5c99f2`
    5. `#3e87e6` (Darkest)
- **Clue Rendering**:
    - Map over 5 slots.
    - Each slot has a fixed background color from the palette.
    - Content: `index < revealedCount ? clue : "CLUE " + (index + 1)`.
    - Styling: Centered text, bold, uppercase.
- **Instruction Box**:
    - A div with a subtle border, rounded corners, and centered gray text.
- **Input Area**:
    - A `flex` container with a bottom border-only input or a very subtle rounded input.
    - The "X of 5" counter as a `rounded-full` gray pill on the right.

### Logic Updates
- **Reveal on Error**: If a guess is incorrect, increment `revealedCount` (up to 5).
- **Correct Guess**: Reveal all clues immediately and show success state.

## 4. Verification
### Automated Tests
- Verify all 5 colored slots are present.
- Verify "CLUE X" text is shown for unrevealed slots.
- Verify counter updates to "2 of 5" after one failed guess.

### Manual Verification
- Open the application at `/#/linkedin-games`.
- Start a Pinpoint puzzle.
- **Initial State**: Observe 5 boxes. Only 1 is revealed (lightest blue). 4 are locked with icons.
- **Incorrect Guess**: Submit an incorrect guess. The next clue should reveal with an animation and a slightly darker blue background.
- **Success State**: Submit the correct answer. All clues should reveal (if not already) or transition to a success state.
