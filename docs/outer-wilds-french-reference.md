# Design Document: Outer Wilds Riddle - Next Location Reference ("The French")

## 1. What is being changed/added
We are modifying the `CongratsStage` of the "Outer Wilds" riddle to include an interactive Nomai Projection Pool / Scroll component.
When the player solves the final stage of the Outer Wilds riddle, they will see:
- A Nomai Projection Pool interface (glowing teal/blue circles, pulsing glyphs).
- An interactive option to "Insert Scroll" or "Activate Projection Pool".
- Once activated, a branching spiral of Nomai script (custom SVG lines with glowing animations) will render dynamically.
- A "Translate" action button. Clicking it simulates the Hearthian Translator tool HUD overlay typing out the translated message:
  `"LORE COMPLETED: WE HAVE DETECTED A STABLE SIGNAL NEAR 🇫🇷."`

## 2. Why this approach was chosen (context)
- **Thematic Consistency**: Using the Nomai script and projection pool fits perfectly with the Outer Wilds lore. The player has been translating Nomai text throughout the game, so translating the final hint matches the game's core loop.
- **Aesthetic Premium**: Rather than a static text message or generic image, a glowing SVG Nomai spiral with hover/pulse effects and an in-place typewriter translation HUD feels high-quality and satisfying.
- **Self-Contained**: Simulating the translation on-page keeps the user in the congrats flow without forcing them to switch tabs to the standalone Nomai Translator page (which expects a live camera QR code).

## 3. How it will be implemented

### A. Create the Interactive Component
We will create a new component `NomaiProjection.tsx` under `src/features/riddles/outer-wilds/components/NomaiProjection.tsx` (or directly within `outer-wilds/stages/NomaiProjection.tsx`).

The component will manage state for:
- `isActivated`: whether the projection stone/scroll is placed (showing the spirals).
- `isTranslating`: whether the translation is in progress.
- `translatedText`: the text currently shown in the translation HUD.

#### Visual Elements (SVG & CSS):
- Outer ring of the projection pool with pulsing concentric rings.
- Branching spiral Nomai script lines using SVG `<path>` elements with a dashed stroke-dashoffset animation to simulate the script drawing itself.
- A translation overlay box mimicking the translator tool's design (cyan/teal border, monospace font, scanning scanline).

### B. Update [OuterWilds.tsx](file:///c:/Code/Tax-Refund/src/features/riddles/outer-wilds/OuterWilds.tsx)
1. Import `NomaiProjection` component.
2. In `renderStage` under `case 10:`, inject `<NomaiProjection />` inside the children of `<CongratsStage />`.
3. Wrap the 'Restart Loop' button inside a confirmation state block to prevent accidental clicks from losing the congrats page state.

## 4. Verification
1. Solve the Outer Wilds riddle or skip to stage 10 using the Dev Skip Button.
2. Verify the visual layout: the Projection Pool slot is shown with glowing animations.
3. Click "Insert Projection Stone" / "Activate Pool" and ensure the Nomai spiral draws itself smoothly.
4. Click "Translate" and verify the typewriter HUD overlay prints: `"LORE COMPLETED: WE HAVE DETECTED A STABLE SIGNAL NEAR 🇫🇷."`
5. Click "Restart Loop" and verify that a confirmation prompt appears. Verify that clicking "Cancel" keeps the page state, and clicking "Yes, Restart" resets progress back to stage 0.
