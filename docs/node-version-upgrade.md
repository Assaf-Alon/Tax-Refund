# Node.js Version Upgrade

## 1. What
Upgrading the development environment Node.js version from **v22.1.0** to **v22.12.0** (or latest stable v22).
Adding an `.nvmrc` file to the project root.

## 2. Why
Vite 7.x (or current version) requires Node.js version 20.19+ or 22.12+. Using an incompatible version (v22.1.0) triggers a blocking warning or potential runtime issues.
The upgrade ensures a stable development environment and compatibility with the project's build tools.
Alternatives considered:
- Downgrading Vite: Rejected as it would prevent using modern features and security fixes.
- Upgrading to Node.js 23: Replaced by Node.js 22 LTS as it's more stable for production-like environments, though latest 22 meets the requirements.

## 3. How
1. Use `nvm` (Node Version Manager) to install the latest compatible version:
   ```bash
   nvm install 22
   nvm use 22
   nvm alias default 22
   ```
2. Create an `.nvmrc` file in the root of the project to document the requirement:
   ```text
   v22
   ```

## 4. Verification
- Execute `node -v` to ensure version is >= 22.12.0.
- Execute `npm run dev` and confirm the Vite version warning no longer appears.
