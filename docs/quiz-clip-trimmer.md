# Quiz Clip Trimmer Tool

This document outlines the implementation of a new admin tool: the **Quiz Clip Trimmer**. This tool allows editors to quickly identify and test "optimized clips" (start/end times) from YouTube videos for use in "Name That Song" riddles.

## Context & Rationale
We are adding features that require precise timing for YouTube clips (e.g., song quizzes). Currently, finding the exact second for a start/end marker is a manual process of watching and guestimating. The **Quiz Clip Trimmer** provides a dedicated UI for:
1. Loading a YouTube video.
2. Setting start/end markers based on current playback time.
3. Previewing the result with a "Loop" feature to ensure the clip is perfect.

## Implementation Details

### 1. Component Structure
A new component `QuizClipTrimmer.tsx` will be created in `src/features/admin/`. 
It will encapsulate:
- **YouTube Iframe API Integration**: Managing the player lifecycle, loading videos via ID/URL.
- **State Management**: Storing `startTime`, `endTime`, `isPlayingPreview`, and `videoId`.
- **UI**: A premium, "glassmorphic" interface consistent with the provided design, using Tailwind CSS.

### 2. Integration
- **Routing**: A new route `/admin/trimmer` will be added to `App.tsx`.
- **Dashboard**: A link to this tool will be added to the `AdminDashboard.tsx` "Admin Tools" section.

### 3. Logic
- **URL Parsing**: Extracting the 11-character video ID from various YouTube URL formats.
- **Preview Loop**: Using a `setInterval` (or `requestAnimationFrame`) to monitor current time and seek back to the start point once the end point is reached if looping is enabled.

## Alternatives Considered
- **React-YouTube library**: Rejected to keep dependencies minimal, as the provided raw implementation is already robust and handles specific edge cases (like the origin issue for local development).
- **In-riddle trimming**: Rejected for now. We want a standalone tool for content preparation rather than per-riddle UI complexity.

## Verification
- **Manual Test**: 
    1. Navigate to `/admin/trimmer`.
    2. Paste a YouTube URL.
    3. Play the video and click "Use Current" for start at 5s and end at 10s.
    4. Click "Play Optimized Clip".
    5. Verify it plays from 5s to 10s and loops correctly.
- **Link Check**: Verify the link appears in the Admin Dashboard and works.
