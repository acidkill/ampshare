# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

Based on `package.json`:

*   **Development Server**: `npm run dev` (runs `next dev`)
*   **Production Build**: `npm run build` (runs `next build`)
*   **Start Production Server**: `npm run start` (runs `next start`)
*   **Linting**: `npm run lint` (runs `next lint`)
*   **Testing**: `npm run test` (runs `jest`)
    *   To run a single test file: `npm test -- <path_to_test_file.test.ts>`
    *   To run tests in watch mode: `npm test -- --watch`

## High-Level Code Architecture and Structure

This project, **AmpShare**, is a Next.js application built with TypeScript.

**Core Features (from `docs/blueprint.md`):**

*   **User Authentication**: Simple system for four users across two apartments. The primary authentication logic is in `src/lib/auth.ts`, utilizing `bcryptjs` for password hashing and `uuid` for user IDs. User and SeedUser types are defined in `src/types.ts`. A placeholder database connection module exists at `src/lib/db.ts`.
*   **Scheduling Interface**: A weekly scheduling UI per appliance, per apartment.
*   **Combined Schedule Display**: Color-coded view for both apartments.
*   **Conflict Detection & Resolution**: AI-powered conflict detection with recommendations and manual override.
*   **Real-time Alerts**: Notifications for appliance use and potential overloads.
*   **User Management**: Admin UI for onboarding.

**Project Structure Overview:**

*   **`src/`**: Contains the main application code.
    *   **`src/app/`**: Likely uses Next.js App Router (e.g., `src/app/layout.tsx` exists).
    *   **`src/lib/`**: Contains core library/utility code.
        *   `auth.ts`: Handles user authentication logic (finding users, updating passwords).
        *   `db.ts`: Placeholder for database interaction. Currently returns a mock DB object for build/test purposes.
    *   **`src/types.ts`**: Defines shared TypeScript types like `User` and `SeedUser`.
*   **`docs/`**: Contains project documentation, including `blueprint.md` which outlines features and style guidelines.
*   **Testing**: Uses Jest and React Testing Library. Configuration is in `jest.config.js` and `jest.setup.js`. Test files are expected to be co-located with the code they test or in `__tests__` directories, using a `.test.ts` or `.test.tsx` extension.

**Style Guidelines (from `docs/blueprint.md`):**

*   Primary color: Muted blue (#5D9CEC)
*   Background color: Light gray (#F0F4F8)
*   Accent color: Warm orange (#F2A63A)
*   Font: 'Inter' sans-serif
*   Icons: Clear, minimalist for appliances.
*   Layout: Clean, grid-based.
*   UI: Subtle transitions and animations.
