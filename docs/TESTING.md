# Testing in AmpShare

This document outlines the testing setup, conventions, and guidelines for the AmpShare project.

## Testing Stack

Our testing stack includes:

*   **Jest**: A JavaScript testing framework.
*   **React Testing Library**: For testing React components in a user-centric way.
*   **@testing-library/jest-dom**: Provides custom Jest matchers for asserting on DOM elements.
*   **@testing-library/user-event**: For simulating user interactions.
*   **TypeScript**: All tests are written in TypeScript.

## Running Tests

*   **Run all tests**:
    ```bash
    npm run test
    ```
    This command will also generate a coverage report in the `coverage/` directory.

*   **Run a single test file**:
    ```bash
    npm test -- <path_to_test_file.test.ts>
    ```
    Example: `npm test -- src/lib/auth.test.ts`

*   **Run tests in watch mode**:
    ```bash
    npm test -- --watch
    ```
    This is useful for re-running tests automatically as you make changes.

## Test File Conventions

*   **Location**: Test files should be co-located with the source files they are testing or placed within a `__tests__` directory alongside the source files.
*   **Naming**: Test files should use the `.test.ts` extension for general TypeScript files or `.test.tsx` for files containing JSX (React components).

## Coverage

Test coverage is automatically collected when running `npm run test`.
*   The report is generated in the `coverage/` directory. You can open `coverage/lcov-report/index.html` in a browser to view detailed coverage.
*   **Current Configuration**: Coverage is collected from `src/**/*.{ts,tsx}`, excluding test files, `src/types.ts`, `src/lib/db.ts` (mock DB), and `src/app/layout.tsx`.

## 3. Current Test Baseline (as of 2025-06-05)

This section documents the state of tests after the initial database and auth refactoring.

### 3.1. Test Execution Summary (from `npm run test`):

*   **Suites**: 1 passed, 1 total (`src/lib/auth.test.ts`)
*   **Tests**: 19 passed, 19 total
*   **Snapshots**: 0 total
*   **Time**: Approximately 1.4 - 1.8 seconds.

### 3.2. Code Coverage (Snapshot):

Coverage primarily exists for `src/lib/auth.ts`:

| File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
|---------------|---------|----------|---------|---------|-------------------|
| src/lib/auth.ts | 96.77   | 88.88    | 100     | 98.18   | 75                |

Most other application files (UI components, pages, middleware, `src/lib/db.ts`) currently have 0% direct unit test coverage.

### 3.3. Notable Test Output & Observations:

*   **Console Messages**: The test run for `src/lib/auth.test.ts` produces several `console.error` and `console.log` messages (e.g., "Error in findUserByUsername...", "Login attempt: User unknownuser not found..."). These are **expected** as they originate from tests specifically designed to verify error handling paths and informational logging within `src/lib/auth.ts`. The functions correctly catch simulated errors and return `undefined` or `[]` as asserted by the tests.
*   **JWT Secret Warning**: A `console.warn` is present regarding the use of a default JWT_SECRET in `auth.ts` if `process.env.JWT_SECRET` is not set. This is a valid runtime warning but acceptable for local/test environments where the secret might be intentionally simple or mocked.

### 3.4. Tested Components/Functions (Unit Level):

*   **`src/lib/auth.ts`**:
    *   `findUserByUsername`
    *   `getUserById`
    *   `updateUserPassword`
    *   `getUsersByApartmentId`
    *   `login` (including internal `_findUserByUsernameWithPassword`)

### 3.5. Known Untested Areas (Initial Observation):

*   Direct unit tests for `src/lib/db.ts` functions.
*   All UI components in `src/app/components/`.
*   All page components in `src/app/schedule/` and `src/app/`.
*   `src/middleware.ts`.

## 4. Testing Strategy & Guidelines

*(This section will be populated by Task 1.4)*

## 5. Test Coverage Gaps & Plan

*(This section will be populated by Task 1.5)*
