# Add Translator to Admin Dashboard

## What

Adding a prominent link to the Outer Wilds Translator tool (`/translator`) directly within the Admin Dashboard.

## Why

The Translator tool is a standalone feature currently accessible only by manually navigating to `/#/translator`.
- **Game Master Discovery**: The game master needs a quick and reliable way to access the translator during a live game (e.g., to assist players, verify clues, or test the feature) without having to manually type the URL.
- **Why not the Home Page?**: The translator is an "in-game" secret tool and should not be exposed on the public-facing "Tax Refund" home page.
- **Why not the Riddle Registry?**: The translator is a utility rather than a linear riddle with distinct stages, so it does not fit the `RIDDLE_REGISTRY` model.
- **Why not a Utility Registry?**: Currently, the translator is the *only* standalone utility in the application. Introducing a `UTILITY_REGISTRY` mapping array similar to `RIDDLE_REGISTRY` is premature optimization. It's better to stick to simple, explicit code (a hardcoded `<Link>`) until there are enough utilities (e.g., 2 or 3) to justify standardizing their metadata and routing into a shared structure.

## How

1. **Modify `src/features/admin/AdminDashboard.tsx`:**
   At the bottom of the dashboard (below the Riddle table and settings), we will add a new "Tools" or "Utilities" section.
   Inside this section, we will add a React Router `<Link>` pointing to `/translator` with button-like styling.

   ```tsx
   {/* New section below the table and existing settings */}
   <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
       <h3 className="text-lg font-bold text-gray-800 mb-4">Admin Tools</h3>
       <div className="flex gap-4">
           <Link
               to="/translator"
               className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
           >
               📸 Open Outer Wilds Translator
           </Link>
       </div>
   </div>
   ```

2. **Routing:**
   The route for `/translator` already exists in `src/App.tsx` and works independently. No changes to the routing or the `Translator.tsx` component are required.

## Verification

### Automated tests:
Given there are currently no automated UI rendering tests for `AdminDashboard.tsx`, we will not be adding a new automated test specifically for this link. If snapshot tests existed, they would just need to be updated.

### Manual Verification (Browser):
1. Navigate to the application and scroll to the footer on the home page.
2. Click the "Privacy Policy" link to enter the Admin Dashboard (bypass PIN on localhost, or enter `0000`).
3. Verify that the new **Admin Tools** section is visible below the riddle list.
4. Click the **📸 Open Outer Wilds Translator** button.
5. Verify that the application navigates to the Translator page and requests camera permissions (or shows the Translator UI).
