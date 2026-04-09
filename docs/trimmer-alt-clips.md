# Trimmer: Alternative Start and End Times

This document outlines the design for adding support for an optional, alternative set of start and end times in the `QuizClipTrimmer`.

## 1. What is being changed/added

-   **Data Model Update**: The `SongItem` interface and the exported JSON will now include `altStartTime` and `altEndTime` fields.
-   **Tabbed Marker UI**: The "Markers" section will be updated with a tabbed interface to switch between **Main** (Primary) and **Alt** (Alternative) clips.
-   **Contextual Preview**: The "PREVIEW" button will dynamically play the clip corresponding to the currently selected tab.
-   **Numerical Standardization**: All time-related fields (`startTime`, `endTime`, `altStartTime`, `altEndTime`) will be standardized as `number` types in the state and exported JSON.

## 2. Why this approach?

-   **Dual Previews**: Songs often have multiple "hook" points (e.g., an iconic intro vs. a catchy chorus). Supporting two clips allows for more versatile usage in the game.
-   **Clean UI (Tabs)**: To avoid overloading the "Markers" panel with four input fields and two sets of "SET" buttons, a tabbed interface allows the user to focus on one clip at a time while keeping the layout footprint small.
-   **Standardization**: Converting decimal strings to rounded numbers during the save/export process ensures data consistency and simplifies downstream processing in the game engine.

## 3. How it will be implemented

### 3.1 Data Model
The `SongItem` interface will be updated:
```typescript
interface SongItem {
  // ... existing fields
  startTime: number;
  endTime: number;
  altStartTime: number;
  altEndTime: number;
  // ...
}
```

### 3.2 State Management
New state variables will be added to `QuizClipTrimmer`:
- `activeTab`: `'main' | 'alt'` (defaults to `'main'`)
- `altStartTime`: `string` (UI buffer)
- `altEndTime`: `string` (UI buffer)

**State Synchronization**:
Update the `useEffect` that tracks `currentIndex` and `songs.length` to also initialize the Alt state:
```typescript
setAltStartTime((song.altStartTime ?? 0).toString());
setAltEndTime((song.altEndTime ?? 10).toString());
```

### 3.3 UI Implementation
1.  **Tab Switcher**: Add a segmented toggle inside the "Markers" card, above the input fields.
    ```jsx
    <div className="flex gap-2 p-1 bg-slate-950 rounded-xl mb-4">
      {['main', 'alt'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab as any)}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
            activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {tab} Marker
        </button>
      ))}
    </div>
    ```
2.  **Input Switching**:
    - When `activeTab === 'main'`, show/edit `startTime` and `endTime`.
    - When `activeTab === 'alt'`, show/edit `altStartTime` and `altEndTime`.
3.  **Dynamic Tools**: Update `useCurrentTime` and `startPreview` to branch based on `activeTab`.
    - `useCurrentTime` should update `altStartTime/altEndTime` if `activeTab === 'alt'`.
    - `startPreview` should use `parseFloat(altStartTime)` / `parseFloat(altEndTime)` if `activeTab === 'alt'`.

### 3.4 Save & Export
In `saveCurrentProgress`:
- Ensure `startTime` (Math.floor) and `endTime` (Math.ceil) are saved as numbers.
- Ensure `altStartTime` (Math.floor) and `altEndTime` (Math.ceil) are saved as numbers (defaulting to `0` if empty).

## 4. Verification

### 4.1 Automated Tests
- N/A (Manual UI verification preferred for this refactor).

### 4.2 Manual Verification
1.  **Tab Switching**: verify that switching between "Main" and "Alt" tabs preserves the input values for each.
2.  **Setting Markers**: Set markers for both Main and Alt clips using the "SET" buttons.
3.  **Previewing**:
    - Select "Main" tab and click PREVIEW -> Should play the primary clip.
    - Select "Alt" tab and click PREVIEW -> Should play the alternative clip.
4.  **Export Verification**: Click "Export Results" and verify the resulting `trimmed_songs.json` contains `altStartTime` and `altEndTime` as numbers for the modified songs.
