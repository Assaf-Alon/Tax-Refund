# LinkedIn Games: Next Location Hint

This document details the addition of a narrative hint to the LinkedIn Games puzzle suite, pointing users toward the next location in the riddle sequence.

## 1. Vision & Context

To enhance the immersion of the Tax Refund application, each puzzle suite should provide a thematic "next step" clue upon completion. For the LinkedIn Games, the next location is the **Eli Cohen Museum**.

The hint will leverage the "Professional" persona of the LinkedIn games by providing a "Next Milestone" insight card.

## 2. Design Details

### 2.1 Visual Hint Card
A new "Next Destination" card will be displayed below the congratulatory message. 
- **Style**: Matches the LinkedIn "Insight" card aesthetic.
- **Background**: White or dark gray (depending on mode) with rounded corners and a subtle border.
- **Image**: A portrait of Eli Cohen, displayed as a "Profile Picture" or "Featured Image".
- **Text**: A cryptic reference to the puzzle just solved: *"The location was an answer of one of the games you just played."* (Referencing the "Museum" answer in Pinpoint).

### 2.2 Integration
The hint will be passed as `children` to the `CongratsStage` component in `LinkedInGames.tsx`. This avoids modifying the shared `CongratsStage` logic while allowing stage-specific content.

---

## 3. Technical Implementation

### 3.1 Global Styles (Required)
> [!IMPORTANT]
> The project does not currently have `tailwindcss-animate`. You must add the following utility classes to `src/index.css` to support the animations used in the hint card.

```css
/* src/index.css */
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes slide-in-bottom { from { transform: translateY(1rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.animate-in { animation-duration: 1000ms; animation-fill-mode: both; }
.fade-in { animation-name: fade-in; }
.slide-in-from-bottom-4 { animation-name: slide-in-bottom; }
.duration-1000 { animation-duration: 1000ms; }
.delay-500 { animation-delay: 500ms; }
```

### 3.2 Component Update
Modify the `case 4` return in `src/features/riddles/linkedin/LinkedInGames.tsx` to include the hint card and an exit button.

```tsx
case 4:
    return (
        <CongratsStage 
            title="Executive Performance" 
            subtitle="You've mastered the professional arena." 
            theme={LINKEDIN_CONGRATS_THEME}
        >
            <div className="space-y-12">
                {/* Next Destination Hint Card */}
                <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                    <h3 className="text-xs font-bold text-[#0a66c2] uppercase tracking-wider mb-4 text-left border-b border-gray-100 dark:border-gray-700 pb-2">
                        Professional Milestone: Next Location
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <img 
                            src="/images/eli-cohen.png" 
                            alt="Eli Cohen" 
                            className="w-28 h-28 object-cover rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
                        />
                        <div className="text-left">
                            <p className="text-gray-700 dark:text-gray-200 font-medium text-lg leading-snug">
                                "The location was an answer of one of the LinkedIn games."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Exit Button */}
                <div className="animate-in fade-in duration-1000 delay-1000">
                    <button 
                        onClick={() => window.location.href = '#/'}
                        className="px-8 py-3 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-full font-bold transition-all duration-300 shadow-md"
                    >
                        Return to Personal Dashboard
                    </button>
                </div>
            </div>
        </CongratsStage>
    );
```

### 3.3 Asset Check
Ensure `public/images/eli-cohen.png` exists. If it is missing, create it using the `generate_image` tool with a profile-picture style portrait of Eli Cohen.

---

## 4. Verification Plan

### 4.1 Manual Verification
1.  **Start the app**: Run `npm run dev` and navigate to `/linkedin-games`.
2.  **Skip to Final**: Use the `DevSkipButton` to reach Stage 4.
3.  **Animation Check**: Verify the card fades and slides in smoothly after a short delay.
4.  **Hint Content**: Ensure the Eli Cohen image renders and the text is legible in both light and dark modes.
5.  **Exit Flow**: Click "Return to Personal Dashboard" and verify it navigates back to the root (`#/`).
6.  **Responsiveness**: Shrink the viewport to mobile width and verify the card stacks vertically (image on top, text below).

