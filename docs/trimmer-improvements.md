# Bulk Clip Trimmer Improvements

This document outlines the changes to improve the Bulk Clip Trimmer tool, specifically focusing on user feedback regarding the loading state and layout issues.

## 1. What is being changed/added

- **Loading Indicator for Release Year**: A new loading state will be added to the `QuizClipTrimmer` component. When fetching metadata (specifically the release year) for a YouTube video, a loading spinner will be displayed to provide visual feedback.
- **Release Year Fetching Bug Fix**: The logic for fetching the "Release Year" will be updated to prioritize the official release date over the video upload date.
- **Layout Fix for Bottom Menu**: The footer navigation (bottom menu) will be refactored to prevent it from overlaying the main content. Instead of using `fixed` positioning, it will be integrated into the flex layout of the main content area, ensuring it stays at the bottom without obscuring any elements.

## 2. Why this approach?

### Loading Indicator
- **Approach**: Adding a simple boolean state `isFetchingYear` and a loading spinner from `lucide-react` (`Loader2`) provides immediate feedback.

### Release Year Fetching Bug Fix
- **Context**: Currently, the system uses `%(upload_date)s` from `yt-dlp`. For many music tracks (especially those uploaded to "Topic" channels or re-uploads), the upload date is much later than the actual release year.
- **Approach**: Use `%(release_date,upload_date)s` in the `yt-dlp` output template. This tries to fetch the official `release_date` field (which YouTube Music populates for many tracks) and falls back to `upload_date` if the former is unavailable.
- **POC Result**: 
    - URL: https://music.youtube.com/watch?v=pMTRBNMX2mw
    - `upload_date`: 20220929
    - `release_date`: 20130207 (Correct)
    - Fallback logic correctly returns `2013` for this case and `2009` for a standard video like Rickroll.

### Layout Fix
- **Context**: The previous implementation used `fixed bottom-0`, which requires manual padding (`pb-32`) and manual margin adjustments (`ml-80`) to account for the sidebar. This approach is error-prone and can lead to overlaps if the padding is insufficient or if the sidebar state changes.
- **Approach**: Refactoring the main content area to follow a `flex flex-col` structure where the `header`, `main` (with `flex-1 overflow-y-auto`), and `footer` are siblings. This ensures the footer is always at the bottom of the viewable area, is always visible, and never overlaps the scrollable content.

## 3. How it will be implemented

### Loading Indicator
1.  **Import Update**: Add `Loader2` to the `lucide-react` imports at the top of the file.
2.  **State Initialization**: Add `[isFetchingYear, setIsFetchingYear] = useState(false)` within the `QuizClipTrimmer` component.
3.  **In `fetchYear`**:
    - Call `setIsFetchingYear(true)` at the start of the function.
    - Call `setIsFetchingYear(false)` in the `finally` block to ensure the spinner stops even on error.
4.  **JSX Implementation**: In the "Release Year" section (around line 351), wrap the input in a relative container and render `Loader2` with `animate-spin` when fetching:
    ```tsx
    <div className="flex-1 flex items-center gap-2">
      <label className="...">Release Year</label>
      <div className="relative flex items-center">
        <input ... />
        {isFetchingYear && <Loader2 size={14} className="animate-spin text-indigo-400 absolute -right-6" />}
      </div>
    </div>
    ```

### Release Year Fetching (Backend)
1.  **Modify `vite-plugin-metadata.ts`**:
    - Change the `yt-dlp` command from:
      `yt-dlp --get-filename -o "%(upload_date)s" -- ${id}`
      to:
      `yt-dlp --get-filename -o "%(release_date,upload_date)s" -- ${id}`
2.  **Modify `scripts/update_metadata.py`**:
    - In `get_release_year` function, change the `subprocess.run` arguments:
      `["yt-dlp", "--get-filename", "-o", "%(upload_date)s", "--", youtube_id]`
      to:
      `["yt-dlp", "--get-filename", "-o", "%(release_date,upload_date)s", "--", youtube_id]`

### Layout Refactoring
1.  **Sidebar Wrapper**: Ensure the sidebar and the main content area are siblings in a `flex h-screen overflow-hidden` container.
2.  **Header Cleanup**: Remove `sticky top-0`, `bg-slate-950/80`, `backdrop-blur-md`, and `z-10` from the `<header>` element. These are redundant once only the `main` scrolls.
3.  **Main Content Scroll**: 
    - Update the parent `div` of the main area (currently `flex-1 flex flex-col overflow-y-auto`) to be `overflow-hidden`.
    - Ensure the `<main>` element has `flex-1 overflow-y-auto` and remove the `pb-32` padding.
4.  **Footer Cleanup**: 
    - Remove `fixed bottom-0 right-0 left-0` and `z-20` from the `<footer>`.
    - Remove the conditional margin logic `isSidebarOpen ? 'ml-80' : ''` from the footer's inner div. The footer will now naturally fill the space allocated to its parent container.

## 4. Verification

### Manual Verification
- **Loading State**: Enter a YouTube URL and click "Load". Verify that a loading spinner appears near the "Release Year" field while the request is in progress.
- **Release Year Accuracy**: Use the URL provided in the bug report (`https://music.youtube.com/watch?v=pMTRBNMX2mw`). Verify that the fetched year is `2013` (not `2022`). Verify that standard videos still fetch the upload year (e.g., Rickroll -> `2009`).
- **Layout**: Resize the window and scroll to the bottom of the page. Verify that the footer stays at the bottom and does not cover any content (like the Markers or Preview sections). Verify that the sidebar opening/closing correctly resizes the footer area without layout breaks.
