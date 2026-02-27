# Expedition 33 - Team Builder Stage

## 1. What

A new **drag-and-drop** "Create the Perfect Team!" stage for the Expedition 33 riddle. The player is shown 5 character portraits from Act 2 and must drag the correct 3 into labelled team slots.

### Characters & Roster

All 9 image assets in `src/features/riddles/expedition-33/assets/` will be renamed from shortnames (`esq.png` → `esquie.png`, etc.) to match character names. The 5 characters shown in this stage are the **Act 2** party members:

| Character | Asset File (new name) | Role in Stage |
|-----------|----------------------|---------------|
| Verso     | `verso.png`          | **Correct → Free Aim Spammer** |
| Maelle    | `maelle.png`         | **Correct → Offense / Damage** |
| Sciel     | `sciel.png`          | **Correct → Support** |
| Esquie    | `esquie.png`         | Shown in roster (wrong answer) |
| Gustave   | `gustave.png`        | Shown in roster (wrong answer) |
| Lune      | `lune.png`           | Not shown (asset renamed only) |
| Monoko    | `monoko.png`         | Not shown (asset renamed only) |
| Simon     | `simon.png`          | Not shown — triggers **Gommage** easter egg if added |
| Sophie    | `sophie.png`         | Not shown (asset renamed only) |

### Special Rule: Simon Easter Egg
If the player somehow drags Simon into any slot, Simon's portrait triggers a "Gommage" (erasure) animation — a white-out dissolve effect — and a text appears: **"Huh, why was he even here?"**. Since Simon is not in the 5 displayed characters, this would only apply if we decide to show all 9. Given the user's spec says "5 main characters of Act 2", Simon won't be among them, but **we will include this logic defensively** — Simon's name is checked in the validation function so it can be easily added to the roster later.

### Slot Layout (3 slots)

```
[ Free Aim Spammer ]  [ Offense / Damage ]  [ Support ]
```

### Stage Placement

The new stage is inserted as **stage 5** (0-indexed), between "Antagonist" (currently stage 4) and "Fading Memory" (currently stage 5). This places the interactive team-building challenge before the final brain-teaser, providing a satisfying change of pace.

New flow (8 stages total, 0-indexed):
0. Welcome → 1. The Engineer → 2. Esquie's Rest → 3. Reactive Parry → 4. Antagonist → **5. Team Builder** → 6. Fading Memory → 7. Completed

## 2. Why This Approach

- **Drag-and-drop** is natively supported in HTML5 via `onDragStart`, `onDragOver`, `onDrop`. No external libraries needed — keeps the bundle small and consistent with the existing custom-stage approach.
- **Touch support** is handled by using `onTouchStart`/`onTouchMove`/`onTouchEnd` alongside drag events, as HTML5 drag-and-drop has poor mobile support. We'll implement a simple touch-drag system using `touch` events + absolute positioning for the dragged element.
- Placing it after the Antagonist question and before the Fading Memory creates a good rhythm: lore question → interactive game → panic reading.

### Alternatives Considered
- **Click-to-select** instead of drag-and-drop: Simpler but less fun and doesn't match the "loadout" fantasy.
- **External DnD library** (react-beautiful-dnd, dnd-kit): Overkill for 5 items and 3 slots; adds bundle weight. Rejected.

## 3. How It Will Be Implemented

### 3.1 Rename Assets

Rename files in `src/features/riddles/expedition-33/assets/`:

| Old Name | New Name |
|----------|----------|
| `esq.png` | `esquie.png` |
| `gus.png` | `gustave.png` |
| `lun.png` | `lune.png` |
| `mal.png` | `maelle.png` |
| `mon.png` | `monoko.png` |
| `sci.png` | `sciel.png` |
| `sim.png` | `simon.png` |
| `soph.png` | `sophie.png` |
| `ver.png` | `verso.png` |

No changes to `EsquieStage.tsx` — it imports `Esquie.gif`, which is not being renamed. The renamed PNGs are new imports only used by the new stage.

### 3.2 New Component: `TeamBuilderStage.tsx`

**File:** `src/features/riddles/expedition-33/stages/TeamBuilderStage.tsx`

#### State
```ts
interface SlotState {
  slotLabel: string;           // "Free Aim Spammer" | "Offense / Damage" | "Support"
  assignedCharacter: string | null;  // character id or null
}

// Component state:
const [slots, setSlots] = useState<SlotState[]>(INITIAL_SLOTS);
const [errorMessage, setErrorMessage] = useState<string | null>(null);
const [simonTriggered, setSimonTriggered] = useState(false);
const [isCorrect, setIsCorrect] = useState(false);
```

#### Data Constants
```ts
const CHARACTERS = [
  { id: 'verso', name: 'Verso', image: versoImg },
  { id: 'maelle', name: 'Maëlle', image: maelleImg },
  { id: 'sciel', name: 'Sciel', image: scielImg },
  { id: 'esquie', name: 'Esquie', image: esquieImg },
  { id: 'gustave', name: 'Gustave', image: gustaveImg },
];

const SLOTS: SlotState[] = [
  { slotLabel: 'Free Aim Spammer', assignedCharacter: null },
  { slotLabel: 'Offense / Damage', assignedCharacter: null },
  { slotLabel: 'Support', assignedCharacter: null },
];

const CORRECT_ASSIGNMENT: Record<string, string> = {
  'Free Aim Spammer': 'verso',
  'Offense / Damage': 'maelle',
  'Support': 'sciel',
};
```

#### Drag-and-Drop Logic
- **Desktop**: Use HTML5 `draggable` attribute with `onDragStart` (set `dataTransfer` with character id), `onDragOver` (prevent default), `onDrop` (read character id, assign to slot).
- **Mobile (touch)**: HTML5 drag-and-drop doesn't work on mobile, so we implement a custom touch-drag system:
  - Add a state `dragClone: { characterId: string; x: number; y: number } | null`.
  - On `onTouchStart`: capture the character id, set `dragClone` with initial touch coordinates.
  - On `onTouchMove`: update `dragClone.x` / `dragClone.y` to follow the finger.
  - On `onTouchEnd`: use `document.elementFromPoint(touch.clientX, touch.clientY)` to find which slot (if any) the finger ended over. Assign character if valid, then clear `dragClone`.
  - Render the clone as a `position: fixed; pointer-events: none; z-index: 50` copy of the portrait at `(dragClone.x, dragClone.y)`.
  - Add `touch-action: none` on the roster container to prevent page scrolling during drag.
- Characters already placed in a slot are visually dimmed in the roster (but can be dragged again to swap).
- Dropping a character on an already-filled slot replaces the previous character (who returns to the roster).
- Dragging an already-placed character to a different slot removes them from their original slot (making it empty) and places them in the new slot.

#### Validation
- A "Confirm Team" button is always visible but **grayed out and disabled** until all 3 slots are filled. Once all 3 slots are filled, the button becomes active (emerald-themed, matching the stage style).
- On confirm: check each slot's `assignedCharacter` against `CORRECT_ASSIGNMENT`.
- If all correct → success animation → `onAdvance()` after a brief delay.
- If incorrect → shake animation on wrong slots + error message "That's not quite right..." + clear slots (button returns to grayed-out state).

#### Simon Gommage Effect
- Triggered **on drop** (not on confirm) — when Simon is dropped in any slot:
  1. Set `simonTriggered = true`
  2. Play a CSS animation: `white-out` that fades the screen to white briefly
  3. Simon's portrait dissolves (opacity 0 + scale-down)
  4. Display text: **"Huh, why was he even here?"** in italic emerald text
  5. After 3 seconds, reset state and remove Simon from the slot

#### Visual Design
- Matches the existing emerald/dark-slate Expedition 33 theme.
- Character portraits: ~100px×100px rounded cards with a subtle emerald border, name label below.
- Slot boxes: ~120px×120px dashed-border squares with the role label, glow on `dragOver`.
- Success animation: slots glow gold, "Perfect Team!" text appears.
- All custom animations (`white-out`, shake, success glow) are defined as inline `<style>` blocks inside the component, matching the pattern used in `EsquieStage.tsx`.

### 3.3 Wire Into Orchestrator

**File:** `src/features/riddles/expedition-33/Expedition33.tsx`

- Import `TeamBuilderStage` component.
- Insert new `case 5: return <TeamBuilderStage onAdvance={handleAdvance} />;`
- Bump existing `case 5` (FadingTextStage) to `case 6`, and `case 6` (CongratsStage) to `case 7`.
- Update `DevSkipButton` `totalStages` from `7` to `8`.

### 3.4 Update Registry

**File:** `src/shared/logic/riddleRegistry.ts`

- Change `totalStages: 7` → `totalStages: 8`
- Add `'Team Builder'` to `stageLabels` array at index 5 (before 'Fading Memory').

### 3.5 Update Design Doc

**File:** `docs/expedition-33-riddle.md`

- Add the Team Builder stage description to the riddle flow.
- Update stage count from 7 to 8 and renumber.

## 4. Verification

### Manual Verification (browser)
The dev server is already running (`npm run dev`). After implementation:

1. Navigate to the Expedition 33 riddle page (use DevSkipButton to jump to stage 5).
2. **Desktop drag-and-drop**: Drag each character to different slots, verify visual feedback (highlight on hover, character appears in slot). 
3. **Wrong combo**: Place wrong characters → click Confirm → verify error shake + message + slots clear.
4. **Correct combo**: Drag Verso → Free Aim Spammer, Maëlle → Offense/Damage, Sciel → Support → click Confirm → verify success animation → auto-advance.
5. **Simon easter egg**: (If Simon is in roster) Drop Simon in any slot → verify Gommage white-out + "Huh, why was he even here?" text → verify auto-reset after 3s.
6. **Mobile**: Test touch-drag on a phone or using Chrome DevTools mobile emulation — verify touch events work for dragging.
7. **Admin dashboard**: Verify the registry shows 8 stages with 'Team Builder' label at position 5.
