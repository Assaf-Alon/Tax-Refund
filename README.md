# Scavenger Hunt (Codenamed: Tax-Refund)

## Project Overview
This repository hosts the source code for a Scavenger Hunt application.
**Note:** Externally, this application masquerades as a "Tax Refund" portal to maintain the surprise for the participant.

The application is designed as a series of independent static pages. Each page serves as a "Riddle" or "Task" that the user must solve to progress.

## Key Features
- **Stealth Mode**: The entry point looks like a boring bureaucratic site.
- **Distributed State**: Each riddle is independent; progress is saved locally.
- **Mobile First**: Designed for users on the go.

## Tech Stack
- **React + TypeScript** via Vite
- **TailwindCSS** for styling
- **React Router (HashRouter)** for GitHub Pages-compatible routing
- **Vitest** for unit testing

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The app will be available at `http://localhost:5174`.

- **Tax (cover) site**: `http://localhost:5174/Tax-Refund/`
- **The Cave (pilot riddle)**: `http://localhost:5174/Tax-Refund/#/the-cave`

## Building for Production

```bash
npm run build
```

The static output will be in the `dist/` folder.

## Deployment

This project is automatically deployed to **GitHub Pages** via a GitHub Actions workflow (`.github/workflows/deploy.yml`) on every push to the `main` branch.

The live site will be available at: `https://<your-github-username>.github.io/Tax-Refund/`
