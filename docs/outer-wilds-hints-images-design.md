# Design Document: Outer Wilds Riddle Hints and Images

## 1. What is being changed/added
We are adding hints and helper images to the "Outer Wilds" riddle to match the experience in the "Spider Lair" riddle.
Specifically:
- Moving/copying user-provided images from `C:\Users\Assaf\Downloads` to the `src/features/riddles/outer-wilds/assets/` directory:
  - `feldspar.jpg` -> `src/features/riddles/outer-wilds/assets/feldspar.jpg`
  - `nomai.jpg` -> `src/features/riddles/outer-wilds/assets/nomai.jpg`
  - `Supernova.gif` -> `src/features/riddles/outer-wilds/assets/Supernova.gif`
  - `dark-bramble.gif` -> `src/features/riddles/outer-wilds/assets/dark-bramble.gif`
  - `hourglass-twins.png` -> `src/features/riddles/outer-wilds/assets/hourglass-twins.png`
- Updating the stages of the Outer Wilds riddle in `src/features/riddles/outer-wilds/OuterWilds.tsx` to include `hint`, `hintCooldown`, and `image` props on the `TextAnswerStage` components:
  - **Stage 1 (End of the Loop)**: Show `Supernova.gif` image. Add hint for "22" minutes.
  - **Stage 2 (The Reckless Traveler)**: Add hint and `feldspar.jpg` image.
  - **Stage 4 (The Ancient Architects)**: Add hint and `nomai.jpg` image.
  - **Stage 5 (The Ultimate Power)**: Show `hourglass-twins.png` image by default. Add hint. When the hint is revealed, switch the image to `Supernova.gif`.
  - **Stage 8 (The Blind Terror)**: Add hint and `dark-bramble.gif` image.

## 2. Why this approach was chosen (context)
- **Consistency**: Providing hints and images aligns Outer Wilds riddle with Spider Lair's standard UX, using the existing capabilities built into the `TextAnswerStage` component.
- **Dynamic Image Swapping**: For Stage 5, the image starts as `hourglass-twins.png` and swaps to `Supernova.gif` once the hint is revealed. This provides progressive assistance to the user.
- **Assets Storage**: Keeping the game assets within the project source tree ensures they are packaged correctly by Vite.

## 3. How it will be implemented

### A. Copy the Assets
Copy the images from `C:\Users\Assaf\Downloads/` to `c:\Code\Tax-Refund\src\features\riddles\outer-wilds\assets/`:
- `feldspar.jpg`
- `nomai.jpg`
- `Supernova.gif`
- `dark-bramble.gif`
- `hourglass-twins.png`

### B. Update imports and render calls in [OuterWilds.tsx](file:///c:/Code/Tax-Refund/src/features/riddles/outer-wilds/OuterWilds.tsx)
1. Add imports for the new assets:
```typescript
import feldsparImg from './assets/feldspar.jpg';
import nomaiImg from './assets/nomai.jpg';
import supernovaImg from './assets/Supernova.gif';
import darkBrambleImg from './assets/dark-bramble.gif';
import hourglassTwinsImg from './assets/hourglass-twins.png';
```

2. Modify the `OuterWilds` component state:
- Add `const [ashTwinHintRevealed, setAshTwinHintRevealed] = useState<boolean>(false);` to track whether the Stage 5 hint has been revealed.
- Reset `ashTwinHintRevealed` back to `false` inside `handleAdvance` or when stage changes, similar to `hintRevealed` in Spider Lair.

3. Modify the `renderStage` method:
- **Stage 1**:
  - Add `hint="Think of the length of each time loop in the game in minutes. It is a two-digit number."`
  - Add `hintCooldown={15}`
  - Add `image={supernovaImg}`
- **Stage 2**:
  - Add `hint="The first Hearthian to ever launch into space, now stranded in Dark Bramble."`
  - Add `hintCooldown={20}`
  - Add `image={feldsparImg}`
- **Stage 4**:
  - Add `hint="Three-eyed nomadic species who preceded the Hearthians."`
  - Add `hintCooldown={20}`
  - Add `image={nomaiImg}`
- **Stage 5**:
  - Add `hint="The energy required to send memories back in time. It requires a star to die."`
  - Add `hintCooldown={30}`
  - Add `image={ashTwinHintRevealed ? supernovaImg : hourglassTwinsImg}`
  - Add `onHintReveal={() => setAshTwinHintRevealed(true)}`
- **Stage 8**:
  - Add `hint="Where anglerfish await in the fog."`
  - Add `hintCooldown={30}`
  - Add `image={darkBrambleImg}`

## 4. Verification
1. Walk through the stages (Stages 1, 2, 4, 5, 8).
2. Verify that:
   - Stage 1 displays the `Supernova.gif` image.
   - Stage 5 displays `hourglass-twins.png` initially, and switches to `Supernova.gif` once the hint button is clicked.
