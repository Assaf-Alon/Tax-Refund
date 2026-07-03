# LinkedIn Games: Leaderboard Customization Design

This document details the customization of the LinkedIn Games leaderboard to show specific competitors and their avatars for each of the three game stages.

---

## 1. What is being changed/added
We are modifying the Leaderboard stage (`LeaderboardStage.tsx`) to show a deterministic list of competitors and their corresponding avatar images.
1. The user will be displayed as "Meshi Peled" in 2nd place.
2. "Roy Peled" will always be in 1st place.
3. Competitors in 3rd, 4th, and 5th places will be stage-specific:
   - **Crossclimb (Stage 1)**: 3rd: Ishigami Senku, 4th: Bill Gates, 5th: Assaf Alon
   - **Pinpoint (Stage 2)**: 3rd: Zero, 4th: Bill Gates, 5th: Yves (Eve) Godin
   - **Queens (Stage 3)**: 3rd: L., 4th: Jeffrey Bezos, 5th: Shaul Almagor

Avatar images will be added for:
- Roy Peled (Steve Jobs image)
- Meshi Peled (Meshi image)
- Bill Gates (Bill Gates image)
- Assaf Alon (Assaf image)
- Zero (Zero image)

Other competitors without custom photos (Ishigami Senku, Yves Godin, L., Jeffrey Bezos, Shaul Almagor) will use the default avatar silhouette.

---

## 2. Why this approach was chosen (context)
- **Context**: The LinkedIn riddle suite is designed as a satirical, professional experience. Customizing the leaderboard with the requested names and images heightens this theme and links it back to personal elements (e.g. Roy, Meshi, Assaf).
- **Rejected Alternatives**:
  - *Hardcoding inside components directly without stages configuration*: Hardcoding the list of competitors in the middle of rendering makes the code less readable. We will separate the data definitions for stages to make the logic clean.
  - *Generating images for all competitors*: Only five custom images were provided. Generating or using placeholders for all 10 competitors might clutter the repository with unused assets. The standard fallback silhouette maintains a professional look for other mock players.

---

## 3. How it will be implemented
A junior developer can implement this in one shot by following these steps:

### 3.1 Move and rename the images
Copy the five files from the conversation brain directory to `public/images/leaderboard/`:
- `media__1783065779639.png` -> `public/images/leaderboard/bill-gates.png`
- `media__1783065779649.jpg` -> `public/images/leaderboard/roy-peled.jpg` (Steve Jobs image representing Roy Peled)
- `media__1783065779650.jpg` -> `public/images/leaderboard/assaf-alon.jpg`
- `media__1783065779651.png` -> `public/images/leaderboard/meshi-peled.png`
- `media__1783065779663.png` -> `public/images/leaderboard/zero.png`

### 3.2 Update `LeaderboardStage.tsx`
1. Update `Competitor` interface to include an optional `avatarUrl` field:
   ```typescript
   interface Competitor {
       name: string;
       time: number;
       isUser?: boolean;
       rank: number;
       avatarUrl?: string;
   }
   ```
2. Define the static stage lists based on `gameName`:
   - `Crossclimb`:
     - 1st: Roy Peled (`/images/leaderboard/roy-peled.jpg`)
     - 2nd: Meshi Peled (User, `/images/leaderboard/meshi-peled.png`)
     - 3rd: Ishigami Senku
     - 4th: Bill Gates (`/images/leaderboard/bill-gates.png`)
     - 5th: Assaf Alon (`/images/leaderboard/assaf-alon.jpg`)
   - `Pinpoint`:
     - 1st: Roy Peled
     - 2nd: Meshi Peled (User)
     - 3rd: Zero (`/images/leaderboard/zero.png`)
     - 4th: Bill Gates
     - 5th: Yves (Eve) Godin
   - `Queens`:
     - 1st: Roy Peled
     - 2nd: Meshi Peled (User)
     - 3rd: L.
     - 4th: Jeffrey Bezos
     - 5th: Shaul Almagor

3. Dynamically set the `time` values:
   - Roy Peled (1st): `displayTime * 0.85` (always faster than the user)
   - Meshi Peled (2nd, User): `userTime`
   - 3rd competitor: `displayTime * 1.15`
   - 4th competitor: `displayTime * 1.42`
   - 5th competitor: `displayTime * 1.68`

4. Modify rendering of avatars:
   ```typescript
   {c.avatarUrl ? (
       <img 
           src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${c.avatarUrl}`} 
           alt={c.name} 
           className={`rounded-full object-cover ${c.isUser ? "border-2 border-blue-500" : ""}`} 
           style={{ width: 32, height: 32 }}
       />
   ) : (
       <AvatarSilhouette className={c.isUser ? "border-2 border-blue-500" : ""} />
   )}
   ```

---

## 4. Verification
1. **Automated Testing**: Run unit tests (`npm run test`) and adjust assertions in `LeaderboardStage.test.tsx` to account for the customized names.
2. **Manual Testing**:
   - Start the development server using `npm run dev`.
   - Go to the LinkedIn riddle and complete the first stage (or use the dev skip button to navigate to each leaderboard).
   - Verify that the names match the specification and images display correctly.
