# Feature: Delete Song from Trimmer Playlist

This document outlines the implementation of a "Delete" feature for the Quiz Clip Trimmer, allowing users to remove songs from the left-hand playlist sidebar.

## 1. What is being changed/added

- **Delete Button in Sidebar**: A new trash icon button will be added to each song item in the playlist sidebar.
- **`deleteSong` Functionality**: Logic to remove a song from the state and local storage, ensuring indices and counts are updated correctly.
- **Current Song Handling**: Logic to automatically navigate to the next or previous song if the currently active song is deleted.

## 2. Why this approach?

- **Context**: The trimmer is used to process large lists of songs. Users may encounter duplicate entries or songs that should no longer be part of the quiz for various reasons. Currently, there is no way to remove these items without manually editing `localStorage` or the underlying JSON file.
- **Approach**: Adding a discrete delete button within each list item provides an intuitive way to manage the playlist.
- **Confirmations**: A simple browser confirmation (`window.confirm`) will be used to prevent accidental deletions, as there is currently no "Undo" feature.

## 3. How it will be implemented

### Component: `QuizClipTrimmer.tsx`

1.  **Import Update**:
    - Add `Trash2` to the `lucide-react` imports.

2.  **Implementation of `deleteSong`**:
    - Create a function `deleteSong(indexToDelete: number)`:
        - Confirm deletion with the user.
        - **Auto-save current work**: Call `saveCurrentProgress()` to ensure any changes to the current song's markers aren't lost before mutating the list.
        - Filter the `songs` array to remove the item at `indexToDelete` into a local variable `newSongs`.
        - **Handle `currentIndex` logic**:
            - If `indexToDelete === currentIndex`:
                - If deleting the last item in a multi-item list, decrement `currentIndex`.
                - Otherwise, keep `currentIndex` the same (it will naturally point to the next item).
            - Else if `indexToDelete < currentIndex`:
                - Decrement `currentIndex` to maintain the correct selection.
        - Update states: `setSongs(newSongs)` and `setCurrentIndex(newIndex)`.
        - **Sync LocalStorage**: Immediately call `localStorage.setItem` using the local `newSongs` and `newIndex` variables (to avoid React state race conditions).

3.  **JSX Update (Sidebar)**:
    - **Refactor Sidebar Item**: Change the outer `<button>` wrapping each song to a `<div>` with `onClick` to avoid **nested buttons** (which is invalid HTML).
    - In the `songs.map` section, style this `div` as a container that displays a `Trash2` button on hover.
    - Use `e.stopPropagation()` on the delete button's click event so that clicking "Delete" doesn't also trigger "Select Song".
    - Style the delete button with a red hover state to indicate a destructive action.

```tsx
<div 
  onClick={() => { saveCurrentProgress(); setCurrentIndex(idx); }}
  className={`group cursor-pointer w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
    currentIndex === idx ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800/50 text-slate-400'
  }`}
>
  <div className="min-w-[1.5rem] text-xs font-mono opacity-50">{idx + 1}</div>
  <div className="flex-1 truncate">
    <div className="text-sm font-semibold truncate">{song.name}</div>
    <div className="text-[10px] opacity-60 truncate">{song.info}</div>
  </div>
  {song.status === 'completed' && <CheckCircle size={14} className="text-emerald-500 shrink-0" />}
  
  <button 
    onClick={(e) => { e.stopPropagation(); deleteSong(idx); }}
    className="p-2 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
    title="Delete song"
  >
    <Trash2 size={14} />
  </button>
</div>
```

## 4. Verification

### Manual Verification
1.  **Deletion**: Click the delete icon for a song in the middle of the list. Confirm the prompt. Verify the song is removed from the list and the total count updates.
2.  **State Persistence**: Refresh the page and verify the song remains deleted (localStorage check).
3.  **Active Song Deletion**: Delete the song currently being edited. Verify the trimmer loads the next song automatically.
4.  **Last Song Deletion**: Delete the very last song in the list. Verify the active selection moves to the new last song.
5.  **Event Propagation**: Verify that clicking "Delete" does not trigger the "Load Video" or "Select Song" side effects beyond what is necessary (index adjustment).
