# Scavenger Hunt (Codenamed: Tax-Refund)

## Project Overview
This repository hosts the source code for a Scavenger Hunt application.
**Note:** Externally, this application masquerades as a "Tax Refund" portal to maintain the surprise for the participant. 

The application is designed as a series of independent static pages. Each page serves as a "Riddle" or "Task" that the user must solve to progress.

## Development Methodology
We follow a strict documentation-first approach. 

**Rule:** Every major change to the codebase must be accompanied by a detailed markdown document in the `docs/` directory.

This document must cover:
1.  **What** is being changed/added.
2.  **Why** this approach was chosen (context), and if there were any alternatives considered that were rejected, why they were rejected.
3.  **How** it will be implemented. This should be detailed enough for a junior developer to understand the change and implement it themselves on "one shot".
4.  **Verification**: How the change is tested and verified.

## Key Features
- **Stealth Mode**: The entry point looks like a boring bureaucratic site.
- **Distributed State**: Each riddle is independent; progress is saved locally.
- **Mobile First**: Designed for users on the go.
