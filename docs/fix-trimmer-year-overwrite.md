# Fix: Prevent Overwriting Release Year on Navigation

## 1. What is being changed/added
We are modifying the `loadVideo` function and the navigation logic in `QuizClipTrimmer.tsx` to prevent unnecessary re-fetching of the song's release year when navigating between songs in the playlist.

## 2. Why this approach was chosen (context)
Currently, every time a user navigates to a song, `loadVideo` is called, which unconditionally triggers `fetchYear`. `fetchYear` calls an external API and updates the `year` state. This behavior:
1.  Overwrites any manual edits the user might have made to the release year before they saved or even after they saved (if they navigate away and back).
2.  Performs unnecessary API calls for data we already have.

The chosen approach is to add a condition to `fetchYear` invocation inside `loadVideo`. We will only fetch the year if:
-   The current song does not have a release year set yet.
-   The video ID being loaded is different from the one currently stored for the song (indicating a "link switch").

We considered always fetching but only updating if the local state was empty, but that would still perform unwanted API calls and wouldn't handle the "link switch" case correctly where a re-fetch *is* desired.

## 3. How it will be implemented

### `src/features/admin/QuizClipTrimmer.tsx`

Update `loadVideo` to check conditions before fetching year:

```typescript
  const loadVideo = (idOverride?: string) => {
    const targetUrl = idOverride || videoUrl;
    const videoId = extractVideoId(targetUrl);
    
    if (!videoId) {
      if (!idOverride) alert("Please enter a valid YouTube URL.");
      return;
    }

    if (player) {
      player.destroy();
    }

    if (videoId) {
      const currentSong = songs[currentIndex];
      const hasYear = !!currentSong?.year;
      const isNewVideo = videoId !== currentSong?.youtubeId;

      // Only fetch if we don't have a year OR it's a new video
      if (!hasYear || isNewVideo) {
        fetchYear(videoId);
      }
    }

    setIsPlayerReady(false);
    // ...
```

We will also update `updateMetadata` to ensure it only re-fetches if the video ID is different or if the year is missing, OR perhaps we *should* allow re-fetching in `updateMetadata` because the user might have just fixed the song name (metadata) and wants to see if the API can now find the correct year even for the same video. 

The user's request emphasized "don't overwrite it unless I make some sort of change that it makes sense to re-fetch", and "switch links" was given as an example. 

## 4. Verification

### Manual Verification
1.  Navigate to a song with a year already set.
2.  Change the year manually and save (navigate away and back).
3.  Verify the year is NOT overwritten by the API.
4.  Change the video link and click "Load".
5.  Verify the year IS re-fetched.
