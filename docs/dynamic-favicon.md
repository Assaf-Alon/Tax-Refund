# Dynamic Favicon Implementation

## What
We are adding the ability to dynamically change the browser's favicon based on the current page/route. We are also adding custom favicons for specific riddles.

## Why
The project acts as a "Tax Refund" application as a disguise, but contains different riddles (pages) such as "Outer Wilds" or "Spider Lair". Having the ability to change the favicon dynamically allows us to:
1. Show a boring/generic "Tax Refund" or IRS-like favicon on the main landing pages to maintain the disguise (currently keeping default).
2. Show thematic favicons when the user reaches specific riddles or stages:
   - Outer Wilds: `ow-48.png`
   - Spider Lair: `sl-48.png`

## How

1. **Move Assets**
   Move `tmp/ow-48.png` and `tmp/sl-48.png` to the `public/` directory so they can be accessed dynamically by the browser.

2. **Create a `useFavicon` Hook**
   We will create a new custom hook at `src/hooks/useFavicon.ts`.
   This hook will take a URL string pointing to an image and update the `<link rel="icon">` element in the document's `<head>`.

   ```tsx
   import { useEffect } from 'react';

   export const useFavicon = (href: string) => {
     useEffect(() => {
       let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
       if (!link) {
         link = document.createElement('link');
         link.rel = 'icon';
         document.head.appendChild(link);
       }
       
       // Keep track of the previous favicon
       const previousHref = link.href;
       
       // Update to the new favicon
       link.href = href;

       // Revert back when the component using the hook unmounts
       return () => {
         link!.href = previousHref;
       };
     }, [href]);
   };
   ```

3. **Usage in Route Components**
   - In `src/features/riddles/outer-wilds/OuterWilds.tsx`, call the hook:
   ```tsx
   useFavicon('/ow-48.png');
   ```
   - In `src/features/riddles/spider-lair/SpiderLair.tsx`, call the hook:
   ```tsx
   useFavicon('/sl-48.png');
   ```

## Verification
- Load the main page and verify the default favicon appears in the browser tab.
- Navigate to `/outer-wilds` (or the relevant route) and verify that the favicon updates to `ow-48.png`.
- Navigate to `/spider-lair` and verify that the favicon updates to `sl-48.png`.
- Navigate back to the homepage and verify the favicon reverts to the default one.
