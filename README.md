# Tax Refund Portal

## Project Overview
This repository hosts the source code for the Tax Refund client portal.
It allows users to quickly calculate their estimated tax refund based on minimal inputs, check their refund status, and manage their tax profiles securely.

The application is designed as a series of independent static pages or forms, guiding the user through the submission process smoothly.

## Key Features
- **Secure Portal**: Designed to be a secure and straightforward entry point for tax processing.
- **Distributed State**: Each form step is independent; progress is saved locally to prevent data loss on refresh.
- **Mobile First**: Designed for users on the go to check their refund status anywhere.

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

- **Tax Portal**: `http://localhost:5174/Tax-Refund/`
- **Dashboard Application**: `http://localhost:5174/Tax-Refund/#/`

## Building for Production

```bash
npm run build
```

The static output will be in the `dist/` folder.

## Deployment

This project is automatically deployed to **GitHub Pages** via a GitHub Actions workflow (`.github/workflows/deploy.yml`) on every push to the `main` branch.

The live site will be available at: `https://<your-github-username>.github.io/Tax-Refund/`
