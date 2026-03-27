# Design Doc: LinkedIn Theme Centralization and Light Mode Fix

The message "You've mastered the professional arena." in the LinkedIn games congrats stage is too bright in light mode, making it hard to read. This is caused by hardcoded light colors that do not adapt to the theme.

## 1. What is being changed?

- We are creating a new `src/features/riddles/linkedin/theme.ts` file to centralize LinkedIn-specific themes and colors.
- We are updating `src/features/riddles/linkedin/LinkedInGames.tsx` to use these centralized themes instead of inline styles.
- We are specifically fixing the contrast of the subtitle in the `CongratsStage` for light mode.

## 2. Why this approach?

Using a central "source of truth" for colors and themes prevents inconsistency and makes it easier to maintain light/dark mode support. Hardcoding colors in every component leads to bugs like the one reported.

Alternatives considered:
- Fixing the color inline in `LinkedInGames.tsx`. 
    - *Rejected* because the user specifically asked to "fix the source of truth that refers to these colors or something" to make sure it doesn't happen again.

## 3. How it will be implemented

### Step 1: Create `theme.ts`
Create `src/features/riddles/linkedin/theme.ts` with the following contents:

```typescript
import type { WelcomeTheme, CongratsTheme } from '../../../shared/stages/types';

export const LINKEDIN_WELCOME_THEME: WelcomeTheme = {
    container: "text-center space-y-8 animate-in fade-in zoom-in duration-1000",
    title: "text-5xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight",
    subtitle: "text-xl text-blue-800/80 dark:text-blue-200/60 font-medium",
    button: "px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] uppercase tracking-widest text-sm"
};

export const LINKEDIN_CONGRATS_THEME: CongratsTheme = {
    container: "text-center space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000",
    title: "text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600",
    subtitle: "text-blue-800/80 dark:text-blue-200/80 text-lg font-medium"
};
```

### Step 2: Update `LinkedInGames.tsx`
- Import `LINKEDIN_WELCOME_THEME` and `LINKEDIN_CONGRATS_THEME` from `./theme`.
- Replace the inline `theme` prop in the `renderStage` function for both `WelcomeStage` and `CongratsStage`.

## 4. Verification

- **Manual**: Run the app, go to the LinkedIn game congrats stage, and toggle light/dark mode. Ensure "You've mastered the professional arena." has good contrast in both.
- **Automated**: Run `npm test` for the LinkedIn stages to ensure no regressions.
