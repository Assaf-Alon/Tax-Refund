# [Crossclimb Mobile Fixes]

This document outlines the improvements and fixes for the Crossclimb game, specifically focusing on mobile performance, focus management, and dynamic word association.

## User Review Required

> [!IMPORTANT]
> The top and bottom rows now swap their identities ("stark" vs "store") dynamically once the middle words are sorted. This ensures that "stark" is always near "spark" and "store" is always near "shore", regardless of the ladder direction.

## Proposed Changes

### 1. Mobile Drag & Drop Optimization

To ensure smooth performance and prevent layout "jumping" on mobile:
- **Sensors**: Add `TouchSensor` with a `pressDelay` of 250ms and a `tolerance` of 5px. This prevents the drag from intercepting normal page scrolls.
- **Memoization**: The `useSensors` result MUST be wrapped in `useMemo` (or defined outside the component) to prevent sensor re-initialization on every character typed.
- **CSS Transitions**: Disable CSS transitions on the row while it is being dragged. Browsers often lag when trying to animate a property that is being actively modified by a mouse/touch event.

### 2. Focus & Input Management

- **Sync on Shuffle**: In `handleDragEnd`, update both `activeIndex` (to the new index) and `activeCharIndex` (to 0).
- **Final Phase Entry**: When `isMiddleOrdered` becomes true and the game enters the `FINAL` phase, ensure `activeIndex` is moved to either row 0 or row 5 (whichever is unsolved).

### 3. Dynamic Terminal Row Logic

The "stark" and "store" rows are fixed at the top and bottom. However, if the user sorts the middle words in reverse (bottom-up), the top row might be "shore" and the bottom word "stark".
- **Dynamic Swap**: Implement a `useEffect` that monitors `isMiddleOrdered`. If the distance between `rows[0]` and `rows[1]` is not 1, swap the contents of `rows[0]` and `rows[5]`.

---

## Implementation Details

### [Component] [CrossclimbStage.tsx](file:///home/cowclaw/Tax-Refund/src/features/riddles/linkedin/stages/CrossclimbStage.tsx)

#### [MODIFY] Sensor Setup
```tsx
const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);
// Important: Ensure sensors are not recreated on every render.
```

#### [MODIFY] Row Identity Effect
```tsx
useEffect(() => {
    if (isMiddleOrdered) {
        const firstMiddle = rows[1];
        const topRow = rows[0];
        if (checkDistance(topRow.answer, firstMiddle.answer) !== 1) {
            setRows(prev => {
                const next = [...prev];
                [next[0], next[next.length - 1]] = [next[next.length - 1], next[0]];
                return next;
            });
        }
    }
}, [isMiddleOrdered, rows, checkDistance]);
```

#### [MODIFY] SortableRow Style
```tsx
const { transform, transition, isDragging } = useSortable({ ... });
const style = {
    transform: CSS.Transform.toString(transform),
    // Disable transition string from dnd-kit during drag
    transition: isDragging ? 'none' : transition,
    zIndex: isDragging ? 50 : 1,
};
```

---

## Verification Plan

### Automated Tests
- `npm test`: Verify `CharacterInput` logic remains intact.
- Add a unit test in `CrossclimbStage.test.tsx` (if it exists) to mock `isMiddleOrdered` and verify the row swap.

### Manual Verification
- **Touch Interaction**: Test on mobile emulator. Verify that short taps select the word and long presses (250ms+) initiate drag.
- **Drag Smoothness**: Verify no "ghosting" or lag during middle row reordering.
- **Logic Check**: Solve middle words "spark" -> "shore". Then solve them "shore" -> "spark". In both cases, the adjacent terminal row should become active and expect the correct word (dist-1).
