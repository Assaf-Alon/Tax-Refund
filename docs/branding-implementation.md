# Design Doc: Riddle & Mini-Game Branding (Icons and Titles)

This document outlines the plan to implement custom favicons and document titles for various riddles and mini-games in the Tax Refund application.

## 1. Goal
Improve the user experience and immersion by providing unique browser tab branding (icon and title) for each major section of the app, especially the "Fun" routes (riddles and games).

## 2. Context & Rationale
Currently, all pages use the default "Tax Refund Portal" title and the Vite logo favicon (unless specifically overridden). Some riddles have icons but no custom titles. Providing unique branding makes the "System Override" theme more effective.

**Alternatives considered:**
- Using `react-helmet`: Rejected because we already have a custom `useFavicon` hook and adding a new dependency for just titles is overkill when a simple hook suffices.

## 3. Implementation Details

### 3.1 Icon Processing
We will use `ffmpeg` to resize the provided icons to 48x48 PNGs and move them to the `public/` directory.

| Source File | Destination File | Target Feature |
| :--- | :--- | :--- |
| `tmp/cave.png` | `public/tc-48.png` | The Cave |
| `tmp/hit-song.png` | `public/ih-48.png` | It's a Hit! |
| `tmp/vinyl.png` | `public/vt-48.png` | Vinyl Timeline |
| `tmp/translator.png` | `public/tr-48.png` | Translator |
| `tmp/admin.png` | `public/ad-48.png` | Admin (PinGate) |
| `tmp/trimmer.png` | `public/tm-48.png` | Quiz Clip Trimmer |
| `tmp/money-icon.png` | `public/tax-48.png` | Home Page (Tax Portal) |

### 3.2 New `useTitle` Hook
A new hook `src/hooks/useTitle.ts` will be created to manage `document.title`. It will:
- Set the title on mount.
- Revert to the previous title on unmount.

### 3.3 Component Updates
The following components will be updated to use `useFavicon` and `useTitle`:
- `HomePage.tsx`: "Tax Refund Portal" + `tax-48.png`
- `PinGate.tsx`: "System Admin" + `ad-48.png`
- `QuizClipTrimmer.tsx`: "Clip Trimmer" + `tm-48.png`
- `TheCave.tsx`: "The Cave" + `tc-48.png`
- `ItsAHitRiddle.tsx`: "It's a Hit!" + `ih-48.png`
- `VinylTimelinePage.tsx`: "Vinyl Timeline" + `vt-48.png`
- `Translator.tsx`: "Nomai Translator" + `tr-48.png`

Existing riddles (`SpiderLair`, `OuterWilds`, `Expedition33`, `LinkedInGames`) will be updated to include `useTitle` as well.

## 4. Verification Plan

### Automated Tests
- N/A (UI-centric changes)

### Manual Verification
- Navigate to each route and verify that the browser tab title and favicon update correctly.
- Verify that when navigating back to the Home page, the title and favicon revert to their defaults (or the Home-specific ones).
- Verify icons are correctly sized (48x48) in the `public/` directory.
