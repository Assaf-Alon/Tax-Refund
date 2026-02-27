# Expedition 33 – Final Choice Stage (Verso vs. Maelle)

## 1. What is Being Changed

A new **8th stage** is added to the Expedition 33 riddle, inserted between "Fading Memory" (stage 5) and "Completed" (currently stage 6, will become stage 7). This stage presents the player with the climactic Verso vs. Maelle choice from the Act 3 finale.

### The Mechanic — "The Agonizing Hold"

The screen shows two character cards side-by-side: **Verso** (using `ver.png`) and **Maelle** (using `mal.png`). A dramatic prompt reads:

> *"The Canvas is splitting. Choose the one you stand with."*

The player must **long-press and hold** on the character they want to **keep**. As they hold:

1. A radial progress indicator fills around the chosen card over **5 seconds**.
2. The **unchosen** character's card slowly fades to dust — a particle disintegration effect where the image breaks into tiny fragments that float away and dissolve.
3. The phone vibrates in short pulses using the `navigator.vibrate` API (if supported) to add tactile weight.
4. If the player lifts their finger before the 5 seconds are up, everything resets — both cards return to their original state.
5. Once the full 5 seconds elapse, the surviving character's card pulses with a golden glow, and after a brief dramatic pause (~1s), the stage advances.

## 2. Why This Approach

- **Mobile-first**: Long-press is the most natural mobile gesture. No drag, no hover, no keyboard needed.
- **Emotional weight**: Forcing the player to hold for 5 full seconds while watching the other character disintegrate creates a deliberately uncomfortable, meaningful moment — mirroring the gravity of the in-game choice.
- **Gommage callback**: The dust/disintegration effect ties directly to the game's Erasure (Gommage) theme that runs through the entire riddle.
- **Reset on lift**: Lets the player hesitate and second-guess themselves, which adds to the drama.

**Alternatives rejected:**

- *Swipe-based*: Feels too casual / dating-app-like for a dramatic finale moment.
- *Scratch-off / rub erasure*: Requires precise `touchmove` coordinate tracking over an image which is finicky on different mobile screen sizes and DPR values.
- *Tap to choose*: Too quick and anticlimactic — doesn't convey the weight of the decision.

## 3. How It Will Be Implemented

### New File

#### [NEW] [FinalChoiceStage.tsx](file:///home/assaf/code/Tax-Refund/src/features/riddles/expedition-33/stages/FinalChoiceStage.tsx)

A self-contained React component following the same `{ onAdvance: () => void }` prop pattern as all other custom stages.

**State:**

```ts
const [activeChoice, setActiveChoice] = useState<'verso' | 'maelle' | null>(null);
const [progress, setProgress] = useState(0);       // 0 to 1 (fraction of 5s)
const [completed, setCompleted] = useState(false);  // locks in once 5s reached
```

**Constants:**

```ts
const HOLD_DURATION_MS = 5000;
const VIBRATION_INTERVAL_MS = 500;
const PARTICLE_COUNT = 40; // number of dust particles for the disintegration
```

**Touch/pointer handling:**

Use `onPointerDown` and `onPointerUp` / `onPointerCancel` / `onPointerLeave` on each card. Pointer events work on both mobile (touch) and desktop (mouse), no need for separate touch handlers.

```ts
// On pointer down on a card:
const handlePointerDown = (choice: 'verso' | 'maelle') => {
    if (completed) return;
    setActiveChoice(choice);
    holdStartRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(updateProgress);
};

// On pointer up/cancel/leave:
const handlePointerUp = () => {
    if (completed) return;
    setActiveChoice(null);
    setProgress(0);
    cancelAnimationFrame(animFrameRef.current);
};
```

**Progress animation loop:**

A `requestAnimationFrame` loop that runs while the pointer is held down. It calculates elapsed time since `holdStartRef`, updates `progress` (0→1), and triggers vibration pulses. When `progress >= 1`:

```ts
const updateProgress = (time: number) => {
    const elapsed = time - holdStartRef.current!;
    const p = Math.min(elapsed / HOLD_DURATION_MS, 1);
    setProgress(p);

    // Vibrate every 500ms (if supported)
    if (navigator.vibrate && Math.floor(elapsed / VIBRATION_INTERVAL_MS) > lastVibrationRef.current) {
        navigator.vibrate(50); // 50ms buzz
        lastVibrationRef.current = Math.floor(elapsed / VIBRATION_INTERVAL_MS);
    }

    if (p >= 1) {
        setCompleted(true);
        navigator.vibrate?.(200); // final longer buzz
        setTimeout(() => onAdvance(), 1500);
        return;
    }
    animFrameRef.current = requestAnimationFrame(updateProgress);
};
```

**Dust disintegration effect (CSS):**

The unchosen card's image gets an overlay of absolutely-positioned small squares (`<div>` particles). As `progress` increases, these particles:
- Gradually become visible (opacity 0 → 1 staggered by index).
- Drift outward with random x/y translations + rotation via CSS `transform`.
- The card image itself fades out in parallel (`opacity: 1 - progress`).

Implementation: Generate `PARTICLE_COUNT` particles with pre-randomized offsets on mount (stored in a `useMemo`). Each particle is a small `div` (6×6px, same color as the background gradient). Their animation is driven by the `progress` state via inline styles:

```tsx
// Each particle picks a random direction and distance
const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        // Random offset from center of the card
        originX: Math.random() * 100, // % position within card
        originY: Math.random() * 100,
        // Random drift direction
        driftX: (Math.random() - 0.5) * 200, // px
        driftY: (Math.random() - 0.5) * 200 - 80, // bias upward
        delay: Math.random() * 0.6, // stagger: only animate when progress > delay
        rotation: Math.random() * 360,
    })),
[]);
```

Each particle renders with:

```tsx
style={{
    left: `${p.originX}%`,
    top: `${p.originY}%`,
    opacity: adjustedProgress > 0 ? 1 - adjustedProgress : 0,
    transform: `translate(${p.driftX * adjustedProgress}px, ${p.driftY * adjustedProgress}px) rotate(${p.rotation * adjustedProgress}deg)`,
    transition: 'none', // driven by RAF, not CSS transitions
}}
```

**Progress ring:**

Around the actively held card, render an SVG circle with `stroke-dasharray` and `stroke-dashoffset` driven by `progress`. This gives a clean, smooth radial fill effect:

```tsx
<svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
    <circle
        cx="50%" cy="50%" r="48%"
        fill="none"
        stroke="rgba(251,191,36,0.8)" // amber glow
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        strokeLinecap="round"
    />
</svg>
```

**Layout (JSX structure):**

```
┌──────────────────────────────────────┐
│         "The Canvas is splitting.    │
│    Choose the one you stand with."   │
│                                      │
│    ┌──────────┐   ┌──────────┐       │
│    │          │   │          │       │
│    │  Verso   │   │  Maelle  │       │
│    │  (card)  │   │  (card)  │       │
│    │          │   │          │       │
│    └──────────┘   └──────────┘       │
│       VERSO          MAELLE          │
│                                      │
│        "Hold to choose..."           │
└──────────────────────────────────────┘
```

Cards are responsive (`w-36 h-48` on mobile). Each card container has:
- The character image
- The SVG progress ring (only visible when that card is actively held)
- The dust particle overlay (only visible on the *other* card when one is held)
- A label underneath

---

### Modified Files

#### [MODIFY] [Expedition33.tsx](file:///home/assaf/code/Tax-Refund/src/features/riddles/expedition-33/Expedition33.tsx)

1. Import `FinalChoiceStage`.
2. Insert a new `case 6` in the `renderStage` switch for the Final Choice stage.
3. Shift `CongratsStage` to `case 7` (and `default`).
4. Update `totalStages` passed to `DevSkipButton` from `7` to `8`.

#### [MODIFY] [riddleRegistry.ts](file:///home/assaf/code/Tax-Refund/src/shared/logic/riddleRegistry.ts)

Update the `expedition-33` entry:
- `totalStages: 7` → `totalStages: 8`
- Add `'The Final Choice'` to `stageLabels` between `'Fading Memory'` and `'Completed'`.

## 4. Verification

### Manual Verification (Mobile)

Since this stage is entirely interaction-based (long-press, vibration, visual effects), manual testing on a mobile device is the most valuable verification:

1. Navigate to the Expedition 33 riddle and use the Dev Skip button to reach stage 6 (Final Choice).
2. **Visual check**: Both character cards (Verso and Maelle) are visible, properly sized, with labels.
3. **Hold Verso card**: Press and hold on Verso's card.
   - Confirm the progress ring fills around Verso's card.
   - Confirm Maelle's card simultaneously disintegrates (particles drift, image fades).
   - **Lift finger at ~2s** → everything resets cleanly (both cards fully restored, no stuck particles).
4. **Hold Maelle card**: Same test but holding Maelle. Verso should disintegrate this time.
5. **Full 5s hold**: Hold a card for the full 5 seconds.
   - Confirm the surviving card pulses with a golden glow on completion.
   - Confirm the stage advances after the brief pause.
   - Confirm vibration pulses are felt during the hold (on devices that support it).
6. **Admin dashboard**: Verify the admin dashboard shows 8 stages for Expedition 33 with the correct label "The Final Choice".
