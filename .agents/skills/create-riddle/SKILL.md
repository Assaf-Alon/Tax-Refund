---
name: Create New Riddle
description: Instructions for creating a new riddle/game in the Tax Refund application.
---

# Creating a New Riddle

To ensure consistency across the Tax Refund application, follow these conventions when creating a new riddle.

## 1. Directory Structure

Place all files for the new riddle in a dedicated directory under `src/features/riddles/`.

```text
src/features/riddles/my-new-riddle/
├── assets/             # Media files (images, audio)
├── stages/             # Individual stage components
│   └── __tests__/      # Tests for complex stages
├── theme.ts            # Centralized theme definitions
└── MyNewRiddle.tsx     # Main entry point component
```

## 2. Theme Centralization (`theme.ts`)

Every riddle MUST have a `theme.ts` file. This centralizes all Tailwind classes and colors, making it easier to maintain and fix contrast issues (especially for light/dark mode).

### Example `theme.ts`
```typescript
import type { WelcomeTheme, CongratsTheme, TextAnswerTheme } from '../../../shared/stages/types';

export const MY_RIDDLE_COLORS = {
    primary: '#ff0000',
    background: '#0a0a0a',
};

export const SHARED_TEXT_THEME: TextAnswerTheme = {
    title: "text-3xl font-bold text-red-500",
    promptText: "text-lg text-gray-300",
    // ...other props
};

export const WELCOME_THEME: WelcomeTheme = {
    button: "px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded shadow-lg"
};

export const CONGRATS_THEME: CongratsTheme = {
    title: "text-5xl font-black text-red-400"
};
```

## 3. Main Component Structure

Your main component should manage the state and render the appropriate stage.

- Use `getRiddleProgress` and `updateRiddleProgress` for persistence.
- Use `useFavicon` to set a custom favicon if applicable.
- Use `useAudio` for background music.
- Import and apply themes from `./theme`.

```tsx
import React, { useState, useEffect } from 'react';
import { getRiddleProgress, updateRiddleProgress } from '../../../shared/logic/gameState';
import { WelcomeStage, CongratsStage, TextAnswerStage } from '../../../shared/stages';
import { SHARED_TEXT_THEME, WELCOME_THEME, CONGRATS_THEME } from './theme';

const RIDDLE_ID = 'my-new-riddle';

export const MyNewRiddle: React.FC = () => {
    const [stage, setStage] = useState(0);

    const handleAdvance = () => {
        const nextStage = stage + 1;
        setStage(nextStage);
        updateRiddleProgress(RIDDLE_ID, nextStage);
    };

    // ... render logic ...
};
```

## 4. Shared Components

Leverage the components in `src/shared/stages/` whenever possible:
- `WelcomeStage`: For the intro screen.
- `CongratsStage`: For the success screen.
- `TextAnswerStage`: For simple text-based riddles.
- `PinAnswerStage`: For numeric PIN inputs.

## 5. Visual Standards

- **Wow Factor**: Ensure the design feels premium and matches the riddle's theme.
- **Dark/Light Mode**: Always test in both modes. If your riddle has a fixed dark/theme background (like `Outer Wilds`), ensure all text remains legible.
- **Animations**: Use Tailwind's transition classes or `animate-in` utilities for smooth stage entries.
