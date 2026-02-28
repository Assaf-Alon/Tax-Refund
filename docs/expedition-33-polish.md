# Expedition 33 Polish and Fixes

## 1. What is being changed
- **Simon OST Stage**: Fix mobile layout so all 13 options fit without scrolling, and increase the success message duration to 4 seconds to allow reading the longer text.
- **Reactive Parry Stage**: Update the instruction text to mention the existance of a dodge option, and reduce the "We don't do that here" punishment duration from 4 seconds to 3 seconds.
- **Team Builder Stage**: Shuffle the character roster order so it isn't static, and adjust the drop boxes (slots) to fit on a single row on mobile displays.
- **Documentation**: Consolidate all the individual Expedition 33 design docs (`simon-ost-stage.md`, `expedition-33-team-builder.md`, `expedition-33-dodge-joke.md`, `expedition-33-final-choice.md`) into the main `expedition-33-riddle.md` file, covering the main product and dev ideas, and delete the obsolete files.

## 2. Why it is being changed
- **UX/Mobile First**: The 13 options in the Simon stage and the 3 drop slots in the Team Builder stage currently require scrolling on smaller screens, disrupting the flow.
- **Timing and Feedback**: 1.5 seconds isn't enough to read the Simon stage easter egg message. 4 seconds for the Parry stage dodge joke drags on too long.
- **Housekeeping**: The `docs/` folder has accumulated many separate markdown files for Expedition 33 as it was built iteratively. A single consolidated document is easier to maintain and read.

## 3. How it will be implemented

### Simon OST & Multiple Choice Updates
- In `src/shared/components/stages/MultipleChoiceStage.tsx`:
  - Update the `MultipleChoiceStageProps` interface to include `successDelay?: number`.
  - Extract the internal `shuffleArray` function into a new utility file (`src/shared/utils/array.ts`) and import it here so it can be reused later.
  - Read `successDelay` from props (defaulting to `1500`). Use this in the `setTimeout` when a correct choice is made.
  - Modify the button tailwind classes to use smaller padding and text on mobile (`px-2 py-2 text-xs md:text-base md:px-4 md:py-3`), and tighten the grid gap (`gap-2 md:gap-3`) to prevent scrolling. **Crucially, make sure to apply these responsive padding/text classes to ALL FOUR states returned by the `getButtonClass` function!**
- In `src/features/riddles/expedition-33/stages/SimonOstStage.tsx`:
  - Pass `successDelay={4000}` to the `MultipleChoiceStage`.

### Reactive Parry Stage
- In `src/features/riddles/expedition-33/stages/ReactiveParryStage.tsx`:
  - Update the `description` prop string to mention Dodge: `"An enemy is striking! Press PARRY (or DODGE if you REALLY need it...) when the closing ring matches the center ring."`.
  - Update the `setTimeout` in `handleDodgeClick` from `4000` to `3000`.

### Team Builder Stage
- In `src/features/riddles/expedition-33/stages/TeamBuilderStage.tsx`:
  - Import the newly extracted `shuffleArray` utility and create a shuffled version of the `CHARACTERS` array using `useMemo` with an empty dependency array `[]` to randomize the roster order exactly once on mount. Use this shuffled array to render the roster.
  - Update the slot container to use a responsive grid: `grid grid-cols-3 gap-2 w-full justify-items-center mb-4` instead of `flex-wrap`. 
  - Change the slot dimensions to scale better on mobile (e.g. `w-full max-w-[112px] h-32 md:w-32 md:h-40`), and critically, shrink the assigned character image on mobile (e.g. `w-12 h-12 md:w-20 md:h-20`) so it doesn't overflow the narrower slots.
  - Adjust the slot text size and padding slightly for mobile screens so everything fits.

### Documentation Consolidation
- Bring the high-level descriptions and implementation notes of:
  - Team Builder
  - Final Choice
  - Dodge Joke
  - Simon OST
- Into `docs/expedition-33-riddle.md` as bullet points under the Stage Flow and Implementation sections.
- Make sure to emphasize the main ideas for both product and dev (i.e. new generic stages created for this).
- Delete the 4 individual markdown files once merged.

## 4. Verification
- Start the app and load the `/xp-33` page with a mobile viewport size using the browser tool.
- Verify the Simon OST options fit on a single screen without scrolling.
- Verify clicking correct Simon option shows message for 4 seconds before advancing.
- Verify Reactive Parry text mentions Dodge, and clicking Dodge blocks the parry for exactly 3 seconds.
- Verify Team Builder slots fit in a single row without wrapping on mobile, and roster is shuffled on reload.
- Verify `docs/expedition-33-riddle.md` contains the merged info and is at least 150 lines, and the other docs are deleted.
