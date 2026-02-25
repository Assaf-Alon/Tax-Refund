# Design Document: Lightweight Translator Integration

## 1. What is being changed/added
We are integrating the existing "Nomai Translator" tool (currently standalone in `src/features/translator/`) into the main React application.
- Added a new route `/translator`.
- Converted the raw HTML/JS/CSS implementation into a React-friendly component structure.
- Maintained the "Lightweight" requirement by using dynamic imports (Lazy Loading) and minimal dependencies.

## 2. Why this approach was chosen
### Approach: React Port with Lazy Loading
- **Alternative 1: Iframe**.
    - *Pro*: Zero code changes.
    - *Con*: Heavy, hard to communicate with main app, breaks "single page" feel, potential camera permission issues in cross-origin or even same-origin iframes on some mobile browsers.
    - *Rejected*: Too "hacky" and doesn't follow the project's React structure.
- **Alternative 2: Raw Script Injection**.
    - *Pro*: Keep existing files.
    - *Con*: `document.getElementById` and globals in a React app lead to memory leaks and difficulty managing component lifecycle (starting/stopping camera).
    - *Rejected*: Hard to maintain.
- **Chosen Approach: Refactor to React + Lazy Loading**.
    - *Pro*: Proper lifecycle management (camera stops when you leave the route), type safety (TypeScript), and leverages Vite's code splitting to keep the initial bundle small. The `html5-qrcode` library will only be loaded when the user visits `/translator`.

## 3. How it will be implemented
### Step 1: Create the React Component
Create `src/features/translator/Translator.tsx`.
- Move the logic from `script.js` into a `useEffect` hook.
- Use `useRef` for DOM elements instead of `document.getElementById`.
- Move CSS from `style.css` to `src/features/translator/Translator.css` (scoped).

### Step 2: Update Routing
In `src/App.tsx`:
- Import `lazy` and `Suspense` from React.
- Add `<Route path="/translator" element={<Suspense fallback={<div>Loading...</div>}><Translator /></Suspense>} />`.

### Step 3: Handle Dependencies
- Ensure `html5-qrcode` is available via `npm` (it's not currently in `package.json`).
- **Update**: I noticed `index.html` used a CDN. We will install it via `npm` to ensure offline support and better bundling.

## 4. Verification
### Local Testing
- Navigate to `/#/translator` (since it's a `HashRouter`).
- Verify the "Initialize Translator" button appears.
- Verify camera permissions are requested.
- Verify scanning a QR code triggers the typewriter effect with the Outer Wilds font.
- Verify navigating away from the page stops the camera feed.

### Build Check
- Run `npm run build` to ensure the dynamic import creates a separate chunk for the translator feature.
