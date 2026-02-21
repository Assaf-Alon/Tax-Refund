# Spider Lair Music Design

## What
Adding dynamic background music to the Spider Lair riddle, with a smooth crossfade effect between tracks.
- Upon entering the lair (Stage 0), the track "Toby Fox - Spider Dance.mp3" begins playing.
- After completing the 2nd riddle (`SpiderLairLyricsStage` at `stage === 2`), the original track smoothly crossfades into "Spider Dance Cover.mp3" and continues seamlessly.
- During the crossfade transition, the original track gradually decreases in volume to `0` over 2 seconds, while the new track simultaneously increases in volume from `0` to `1` over the same duration.
- The music loops infinitely while the user remains in the applicable stages.

## Why
Background music enhances immersion, and a smooth crossfade prevents jarring auditory cuts, significantly enhancing the premium feel of the riddle. 

Handling audio natively in React components directly uses raw HTML5 Audio APIs, risking memory leaks or overlapping "ghost" audio tracks if the user manages to advance stages rapidly or unmounts the component during a transition. Abstracting the playback and fading rules into a decoupled, reusable hook (`useAudio.ts`) ensures safe cleanup logic and keeps `SpiderLair.tsx` clean.

## How
1. **Shared Audio Hook (`src/shared/utils/useAudio.ts`)**:
   Implement a custom React hook to manage an `HTMLAudioElement` instance.
   - **Persistence**: 
     - Use `useRef<HTMLAudioElement | null>(null)` (`audioRef`) to keep a persistent reference to the active track.
     - Introduce `fadingAudioRef` to track any audio element currently fading out.
     - Introduce `fadeIntervalRef` and `fadeInIntervalRef` to track active `setInterval` IDs so they can be securely cleared.
   - **Interface**: Accept a `src` string (or `null` to stop) and options (`interface UseAudioOptions { loop?: boolean; crossfadeDuration?: number; }`).
   - **Lifecycle & Playback** (`useEffect` on `[src, options.loop, options.crossfadeDuration]`):
     - **Cleanup Previous Fades**: If `src` changes while a fade is *already* in progress, immediately `clearInterval` on both fading interval refs. Take whatever is in `fadingAudioRef`, forcibly `pause()` it, and clear it.
     - **Initiate Fade Out**: Move the active `audioRef.current` into `fadingAudioRef.current`. Set up a `setInterval` that decreases its `.volume` by a small step every ~50ms based on `crossfadeDuration` until it reaches `0`. Once `0`, call `.pause()` and clear the ref.
     - **Initiate Fade In**: Create the new `Audio(src)`, apply `loop` options, and set it to `audioRef.current`. Set its `.volume` to `0` and call `play()`. Set up a *separate* `setInterval` that increases its `.volume` until it reaches `1`.
     - **Autoplay Handling**: Browsers block audio if there is no prior user interaction. If `play()` throws a `NotAllowedError` (DOMException), gracefully catch it. Add temporary global `click` or `pointerdown` listeners to `document` to attempt automatic playback `audio.play()` when the user next clicks the page.
   - **Unmount Cleanup**: Utilize a separate `useEffect(..., [])` that manages component unmount. It must clear all active intervals directly, and forcefully pause both `audioRef.current` and `fadingAudioRef.current`.

2. **Integration into `SpiderLair.tsx`**:
   - Import both audio assets directly:
     ```tsx
     import spiderDanceOriginal from './assets/Toby Fox - Spider Dance.mp3';
     import spiderDanceCover from './assets/Spider Dance Cover.mp3';
     ```
   - Determine the correct source using the `stage` state:
     ```tsx
     let audioSrc: string | null = null;
     if (stage >= 0 && stage <= 2) {
         audioSrc = spiderDanceOriginal;
     } else if (stage > 2 && stage < 11) { // Up to Congrats page
         audioSrc = spiderDanceCover;
     }
     ```
   - Consume the hook:
     ```tsx
     import { useAudio } from '../../../shared/utils/useAudio';
     
     // Inside SpiderLair component:
     useAudio(audioSrc, { loop: true, crossfadeDuration: 2000 });
     ```

## Verification
1. **Unit Tests (`src/shared/utils/__tests__/useAudio.test.ts`)**:
   - Use `vi.useFakeTimers()` to test crossfades, asserting that changing the `src` prop sets intervals to gracefully adjust the `.volume` constraints of the mocked audio instances within precisely the expected temporal progression.
   - Verify that unmounting component explicitly clears timeouts and pauses both overlapping instances.
2. **Initial Playback**: Navigate to the Spider Lair and verify that "Toby Fox - Spider Dance.mp3" starts playing either immediately or after the first user interaction (Stage 0).
3. **Track Transition**: Complete the PIN stage and the Lyrics stage (transitioning from `stage === 2` to `stage === 3`). Listen closely to confirm that the old track smoothly fades out while the cover track simultaneously fades in over exactly ~2 seconds.
4. **Cleanup**: Navigate completely away from the Spider Lair feature and verify the audio halts with no background ghost noises.
