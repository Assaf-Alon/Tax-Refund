# Architecture Decision: Repository Bootstrap & Technology Stack

**Date:** 2026-02-19
**Status:** Accepted

## Context
We are initializing a new project for a Scavenger Hunt application. The project requires a "cover" identity (Tax Refund portal) and must support complex, interactive logic for various riddles. The app will be deployed to GitHub Pages and typically accessed via mobile devices.

## Decision
We will initialize the repository using the following stack:

1.  **React + TypeScript**: For strong typing and component reusability.
2.  **Vite**: For a fast, modern build pipeline.
3.  **TailwindCSS**: For rapid UI development.
4.  **React Router (HashRouter)**: For client-side routing compatible with static hosting.
5.  **GitHub Pages**: For hosting.
6.  **Vitest**: For unit testing (with strict timeboxing).

## Detailed Reasoning & Implementation Specs

### 1. React + TypeScript
*   **Why**: The "Riddles" will likely require complex state management (e.g., multi-stage puzzles, input validation). React's component model allows us to encapsulate this logic. TypeScript ensures code quality and easier refactoring as the project grows.
*   **Alternatives Considered**: 
    *   *Vanilla JS*: Hard to manage state for complex riddles.
    *   *Vue/Svelte*: Valid options, but React was chosen for ecosystem familiarity and strict typing support.
*   **Initialization**: `npm create vite@latest . -- --template react-ts`


### 2. Vite
*   **Why**: We need a purely static output (`dist/` folder) for GitHub Pages. Vite is significantly faster than CRA (Create React App) and requires less configuration.
*   **Alternatives Considered**:
    *   *Next.js*: While powerful, Next.js features like SSR/ISR are not needed for this specific static deployment, and its static export can sometimes be finicky with dynamic routing on GitHub Pages without configuration overrides. Vite keeps it simple.

### 3. TailwindCSS & Theming
*   **Why**: We need two distinct looks: "Boring Tax Site" (Bootstrap-like) and "Fun Riddle" (Custom/Vibrant).
*   **Implementation**: We will use **Layout Components** (`<TaxLayout>` vs `<RiddleLayout>`) to wrap pages.
    *   `<TaxLayout>`: Sets a "boring" class on the root, uses standard grays/blues.
    *   `<RiddleLayout>`: Sets a "fun" class, enabling vibrant variables.
    *   Tailwind config will use CSS variables for colors (e.g., `bg-primary` maps to `--color-primary`) allowing layouts to swap palettes easily.

### 4. HashRouter (`/#/audit-appeal`)
*   **Why**: GitHub Pages does not support SPA routing natively. `HashRouter` ensures reliability.
*   **Strategy**: "Obfuscated Fun" URLs.
    *   **Structure**: We will NOT use predictable IDs (e.g., `/riddle/1`).
    *   **Implementation**: We will use thematic slugs (e.g., `/form-1040-error`, `/appeal-process`, `/submit-evidence`) that act as part of the immersion.
    *   **Security**: The URL is the "Key". If a user knows the URL, they can access the riddle.

### 5. State Persistence
*   **Mechanism**: `localStorage` (Key: `tr_gamestate`).
*   **Schema**:
    ```typescript
    interface GameState {
      // Tracks progress WITHIN a multi-stage riddle (e.g., "TheCave": stage 2)
      // Key = Riddle ID (slug), Value = Stage Index
      riddleProgress: Record<string, number>; 
      
      // Optional: Store small inventory items/flags
      inventory: string[]; 
    }
    ```
*   **Logic**:
    *   **Resume**: When a user lands on a Riddle URL, we check `riddleProgress[riddleId]`. If it exists, we restore them to that specific stage (e.g., Stage 3 of "TheCave").
    *   **Global Progress**: We do NOT strictly gate access via state. If a user guesses the URL for Riddle 5, they can play Riddle 5.

### 6. Testing Strategy
*   **Tool**: Vitest.
*   **The 5-Minute Timebox**:
    *   Goal: Velocity > Perfection.
    *   Rule: If a unit test takes > 5 minutes to write/debug, DELETE IT and add a `TODO: Fix test` comment.
    *   Focus: Test complex logic (e.g., puzzle validation), skip UI testing.

### 7. Directory Structure
```text
src/
├── features/        # Feature-based modules
│   ├── taxes/       # The "Boring" cover site components
│   └── riddles/     # The "Fun" game components
├── shared/          # Reusable utilities
│   ├── ui/          # Generic UI components (Buttons, Inputs)
│   └── logic/       # Game engine logic, state hooks
├── layouts/         # Theme wrappers (TaxLayout, RiddleLayout)
└── main.tsx         # Entry point
```

## Pilot Implementation: "The Cave"
To validate the architecture (State, Routing, Layouts), we will implement a "Pilot Riddle" called **The Cave**. This is technical content only; real game content is out of scope.

*   **URL**: `/#/the-cave`
*   **Theme**: Uses `<RiddleLayout>` (Dark mode, spooky font).
*   **Stages**:
    1.  **Entrance**: Simple button ("Enter").
        *   *Test*: Event handling, initial state creation.
    2.  **The Riddle**: Input field requiring the text "Crawl" (case-insensitive).
        *   *Test*: Input validation, state persistence (refreshing page keeps user here).
    3.  **The Exit**: Button ("Leave").
        *   *Test*: State transition to completion.
    4.  **Victory**: Static "Congratulations" page.

## Verification Plan
1.  **Build Check**: `npm run build` must produce a `dist` folder with a single `index.html`.
2.  **Deploy Check**: GitHub Pages deployment works without 404s on refresh.
3.  **Persistence Check**:
    *   Start "TheCave" riddle.
    *   Advance to Stage 2.
    *   Refresh Browser.
    *   Verify user is still on "TheCave" Stage 2.
