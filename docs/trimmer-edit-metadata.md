# Feature: Edit Song Metadata in Trimmer

This document outlines the implementation of a metadata editing feature for the Quiz Clip Trimmer, allowing users to correct song names and anime information directly within the tool.

## 1. What is being changed/added

- **Edit Button**: A pencil icon button next to the song title in the main trimmer view.
- **Edit Metadata Modal**: A modal window that appears when the edit button is clicked, containing fields for:
    - **Song Name** (Artist - Title)
    - **Anime / Section** (e.g., Oshi no Ko OP 1)
- **Metadata Persistence**: Changes are saved to the `songs` state and synchronized with `localStorage`.
- **Search Sync**: Updating the song name will automatically update the `query` field used for YouTube Music searches.
- **Release Year Re-fetch**: Saving metadata changes will trigger a fresh fetch of the release year for the currently loaded video.

## 2. Why this approach?

- **Context**: The source data (`songs.json`) sometimes contains incorrect or poorly formatted metadata. Users need a way to fix this "on the fly" to ensure the final exported data is accurate.
- **Approach**: A modal window provides a focused environment for editing without cluttering the main trimming interface. 
- **Search Sync**: Keeping the `query` in sync with the `name` ensures that if a user corrects a song name, the next time they click "Search", they get more relevant YouTube results.
- **Re-fetch**: Triggering a re-fetch of the release year after metadata changes ensures the UI stays consistent and attempts to reconcile the new metadata with the current video.

## 3. How it will be implemented

### Component: `QuizClipTrimmer.tsx`

1.  **State Additions**:
    - `isEditModalOpen`: Boolean to control modal visibility.
    - `editName`: Temporary string for the name input.
    - `editInfo`: Temporary string for the info input.

2.  **New Icon Imports**:
    - Add `Edit2` and `X` to the `lucide-react` imports.

3.  **Core Functions**:

    - **`openEditModal`**: Use this to initialize the temporary state when opening.
      ```tsx
      const openEditModal = () => {
        setEditName(currentSong.name);
        setEditInfo(currentSong.info);
        setIsEditModalOpen(true);
      };
      ```

    - **`updateMetadata`**: Update the state and persist to localStorage.
      ```tsx
      const updateMetadata = () => {
        setSongs(prevSongs => {
          const updated = [...prevSongs];
          updated[currentIndex] = {
            ...updated[currentIndex],
            name: editName,
            info: editInfo,
            query: editName // Keep search query in sync
          };
          localStorage.setItem('trimmer_songs', JSON.stringify(updated));
          return updated;
        });

        setIsEditModalOpen(false);

        // Re-fetch year for the new metadata
        const videoId = extractVideoId(videoUrl);
        if (videoId) fetchYear(videoId);
      };
      ```

4.  **JSX Updates**:

    - **Edit Button Placement**: Wrap the title in a container with a button (around line 380).
      ```tsx
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{currentSong.info}</span>
            <h2 className="text-2xl font-black text-white">{currentSong.name}</h2>
        </div>
        <button 
          onClick={openEditModal}
          className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-lg active:scale-95"
          title="Edit Metadata"
        >
          <Edit2 size={20} />
        </button>
      </div>
      ```

    - **Modal Component**: Place at the bottom of the main component return.
      ```tsx
      {/* Metadata Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Edit Metadata</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Song Name (Artist - Title)</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Anime / Section</label>
                <input 
                  type="text" 
                  value={editInfo}
                  onChange={(e) => setEditInfo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 transition-all text-slate-300"
              >
                Cancel
              </button>
              <button 
                onClick={updateMetadata}
                className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition-all text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      ```

## 4. Verification

### Manual Verification
1.  **Open Modal**: Click the pencil icon. Verify the modal opens and inputs are pre-filled with the current song's data.
2.  **Edit and Save**: Change the name and anime info. Click "Save". 
    - Verify the title/subtitle in the main view update.
    - Verify the sidebar entry updates.
    - Verify the "Release Year" triggers a loading indicator (re-fetch).
3.  **Search Check**: After saving a new name, click the "Search" (magnifying glass) icon. Verify the opened YouTube Music search uses the *new* name.
4.  **Escaping**: Ensure clicking "Cancel" or the close icon discards changes.
5.  **Persistence**: Refresh the page and ensure the metadata corrections are still there.
