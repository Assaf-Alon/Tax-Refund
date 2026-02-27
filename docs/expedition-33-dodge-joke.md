# Expedition 33 – Dodge Joke in the Reactive Parry Stage

## 1. What is Being Changed

The `ReactiveParryStage` currently presents two possible outcomes: succeed (parry at the right moment) or miss (ring passes the window). This change adds a **"Dodge" button** as a second action alongside "Parry", turning the parry stage into a small self-referential joke:

- The player cannot actually parry until they have pressed Dodge once.
- When Dodge is pressed, the message **"We don't do that here"** is shown and the Dodge button disappears.
- After this, the parry succeeds normally.

## 2. Why This Approach

The inside joke is that Assaf *always* parries and refuses to dodge. Forcing the player to press Dodge first—and then having the game scold them for it—pays off the joke perfectly. The mechanic also mimics how many games gate progress to make sure the player has "seen" something before moving on.

**Alternatives considered / rejected:**

- *Tooltip / hover message only*: Too easy to miss; doesn't land the joke.
- *Separate stage*: Unnecessary overhead; the joke works as an extension of the existing stage.
- *Both buttons always visible*: If parry could succeed from the start, many players would never try Dodge.

## 3. How It Will Be Implemented

All changes are confined to **`ReactiveParryStage.tsx`**.

### New state

```ts
// Whether the player has pressed Dodge at least once
const [dodgeUsed, setDodgeUsed] = useState(false);

// Whether to show the "We don't do that here" message right now
const [showDodgeMsg, setShowDodgeMsg] = useState(false);
```

### Parry gating

In `handleParryClick`, add a guard at the very top:

```ts
const handleParryClick = () => {
    if (failed || success) return;
    if (!dodgeUsed) {          // <-- new guard
        handleMiss();
        return;
    }
    // ...existing parry logic unchanged...
};
```

This means every parry attempt before Dodge has been pressed will result in a regular "MISSED!" animation, making the player try a few times before finding the Dodge button.

### Dodge handler

```ts
const handleDodgeClick = () => {
    setDodgeUsed(true);
    setShowDodgeMsg(true);
    // Hide the message after 2 seconds
    setTimeout(() => setShowDodgeMsg(false), 2000);
};
```

### UI changes

The action area (currently just the Parry button) becomes:

```tsx
<div className="h-24 flex flex-col items-center gap-4">
    {failed ? (
        <div className="text-red-500 font-bold text-2xl tracking-widest animate-bounce">
            MISSED!
        </div>
    ) : success ? (
        <div className="text-amber-400 font-bold text-3xl tracking-widest animate-pulse ...">
            PERFECT PARRY!
        </div>
    ) : showDodgeMsg ? (
        <div className="text-yellow-300 font-bold text-xl italic animate-pulse">
            We don't do that here
        </div>
    ) : (
        <div className="flex flex-col items-center gap-3">
            <button onClick={handleParryClick} className="...existing parry styles...">
                Parry
            </button>
            {!dodgeUsed && (
                <button
                    onClick={handleDodgeClick}
                    className="px-8 py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-gray-300 font-semibold tracking-wider text-base rounded-xl transition-all uppercase"
                >
                    Dodge
                </button>
            )}
        </div>
    )}
</div>
```

Key points:
- **Dodge button** is only rendered while `!dodgeUsed` — it disappears after the first click and never returns.
- **"We don't do that here"** message is shown temporarily (2 s) in place of the buttons immediately after Dodge is clicked.
- While the message is visible the animation is still running; the player must time a parry *after* the message clears. This keeps the tension.
- After `dodgeUsed` is `true`, the ring game plays exactly as before and the player can succeed.

### State reset

`startAnimation` already resets `failed`, `success`, and `scale`. We intentionally do **not** reset `dodgeUsed` there — once the joke has been seen, Parry should work normally for any subsequent miss-and-retry cycles.

## 4. Verification

- **Before Dodge**: Pressing Parry (even perfectly in the window) always triggers "MISSED!". Confirm by watching the ring land perfectly and checking that the miss animation still fires.
- **Dodge press**: Pressing Dodge once shows "We don't do that here" for ~2 seconds, then the message disappears. The Dodge button is gone. Confirm the button never reappears on subsequent retries.
- **After Dodge**: A perfectly timed parry advances the stage normally. Verify `onAdvance()` is called and the stage transitions.
- **Miss-and-retry after Dodge**: Missing after Dodge still shows "MISSED!" and restarts the ring, but `dodgeUsed` stays `true`—no second Dodge prompt.
