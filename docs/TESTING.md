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

The following strategy and guidelines aim to ensure a robust and maintainable test suite for AmpShare.

### 4.1. Guiding Principles

*   **Test for User Value**: Prioritize tests that verify functionality valuable to the end-user.
*   **Confidence**: Tests should increase confidence in the correctness of the application and in the ability to refactor safely.
*   **Clarity and Readability**: Tests are documentation. They should be easy to understand, explaining what is being tested and why.
*   **Isolation**: Unit tests should be isolated. Integration tests should test the interaction between units.
*   **Speed**: Tests should run quickly to provide fast feedback. Slow tests can hinder development flow.
*   **Automation**: All tests should be automated and runnable with a single command (`npm run test`).

### 4.2. Types of Tests

1.  **Unit Tests**:
    *   **Focus**: Test individual functions, modules, or components in isolation.
    *   **Tools**: Jest.
    *   **When**: For all critical business logic, utility functions, and individual React components (testing props, rendering based on state, basic event handlers).
    *   **Example**: Testing a single function in `src/lib/auth.ts` or a `TimeSlot` component's rendering based on props.

2.  **Integration Tests**:
    *   **Focus**: Test the interaction between multiple units/modules or components. This includes testing how components interact with services or how different parts of the backend logic work together.
    *   **Tools**: Jest, React Testing Library (for UI), potentially MSW (Mock Service Worker) for API mocking.
    *   **When**: For testing user flows within a page (e.g., form submission and subsequent UI update), interaction between UI and data fetching/mutation logic, or how different library functions in `src/lib/` compose together.
    *   **Example**: Testing the complete login flow involving UI components, state management, and calls to `src/lib/auth.ts` (with `src/lib/db.ts` potentially mocked or using a test database instance).

3.  **End-to-End (E2E) Tests** (Future Consideration):
    *   **Focus**: Test the entire application flow from the user's perspective, typically by interacting with the application through the browser.
    *   **Tools**: Cypress, Playwright (to be decided if implemented).
    *   **When**: For critical user paths (e.g., user registration, booking a schedule, resolving a conflict through the UI). These are generally slower and more expensive to maintain, so they should be used judiciously.

### 4.3. General Best Practices

*   **Arrange, Act, Assert (AAA)**: Structure your tests clearly:
    *   **Arrange**: Set up the test conditions (create mocks, initialize data).
    *   **Act**: Execute the code being tested.
    *   **Assert**: Verify the outcome.
*   **Descriptive Test Names**: Use `describe` and `it` blocks with clear, descriptive names that explain the purpose of the test and the expected behavior (e.g., `it('should return undefined if user is not found')`).
*   **Avoid Logic in Tests**: Tests should be simple and direct. Avoid complex logic, loops, or conditionals within test assertions.
*   **Test One Thing at a Time**: Each test case (`it` block) should ideally verify a single behavior or outcome.
*   **Independent Tests**: Tests should not depend on each other or the order in which they are run. Each test should set up its own required state and clean up if necessary (though Jest often handles this with its sandboxed environment per test file).
*   **Use Mocks Effectively**: Mock external dependencies (like API calls, database interactions in unit tests, or complex child components) to isolate the unit under test and make tests more predictable and faster. Clearly indicate what is being mocked.

### 4.4. Guidelines for React Component Testing (using React Testing Library)

*   **Test from the User's Perspective**: Interact with components as a user would (finding elements by accessible roles, text, labels; firing user events).
*   **Accessible Queries**: Prioritize using accessible queries (e.g., `getByRole`, `getByLabelText`, `getByText`). Avoid querying by implementation details (e.g., CSS classes, internal component state names).
*   **Test User Interactions**: Simulate user events (clicks, typing) using `@testing-library/user-event` and assert the expected outcome (e.g., UI changes, callback invocations).
*   **Avoid Testing Implementation Details**: Do not test internal state or private methods of components. Focus on props and user-observable behavior.
*   **Snapshot Testing**: Use sparingly for very simple, static components or to catch unintentional UI changes. Be wary of overuse, as snapshots can become brittle.

### 4.5. Guidelines for API / Backend Logic Testing

*   **`src/lib` functions**: These should be thoroughly unit tested. If they interact with the database (`src/lib/db.ts`), the database interactions should be mocked for unit tests to ensure isolation and speed. (The current `auth.test.ts` demonstrates this by mocking the new db functions).
*   **Database Layer (`src/lib/db.ts`)**: While unit tests for `auth.ts` mock the db layer, direct tests for `db.ts` itself (e.g., using an in-memory SQLite instance) are valuable to ensure SQL queries and data transformations are correct. These would be integration tests for the DB layer.
*   **API Routes (Next.js API handlers)**: Test API routes by mocking their dependencies (like services from `src/lib/`) and making mock HTTP requests to them, then asserting the response (status code, body).

### 4.6. Keeping Tests Updated

*   When fixing a bug, write a test that reproduces the bug first, then fix the code to make the test pass.
*   When adding new features, write tests concurrently with the feature code.
*   When refactoring code, ensure existing tests still pass. If the public API of a module changes, update its tests accordingly.

By following these guidelines, we aim to build a reliable testing culture that supports the development and maintenance of AmpShare.

## 5. Test Coverage Gaps & Plan

This section outlines the current known test coverage gaps and a plan to address them. This plan aligns with the features described in `docs/blueprint.md` and the tasks in the project management system (Task Master AI).

### 5.1. Identified Coverage Gaps (as of 2025-06-05)

Based on the current test baseline and the project's feature set, the following areas have significant coverage gaps:

1.  **Database Layer (`src/lib/db.ts`)**:
    *   **Gap**: No direct unit or integration tests for the SQLite CRUD operations for `Apartment`, `User`, `Appliance`, `ScheduleEntry`, and `Conflict` entities.
    *   **Impact**: Potential errors in SQL queries, data mapping, or transaction handling might go unnoticed.

2.  **Core UI Components (`src/app/components/schedule/`)**:
    *   **Gap**: Most interactive UI components lack tests. This includes:
        *   `ApartmentFilter.tsx`
        *   `ApplianceSelector.tsx`
        *   `CombinedScheduleView.tsx`
        *   `ScheduleGrid.tsx`
    *   **Impact**: Regressions in UI rendering, user interactions, or state management within these components may not be caught automatically.
    *   *Note*: `TimeSlot.tsx` has a basic test file, which will be expanded.

3.  **Page Level Components (`src/app/schedule/` and `src/app/schedule/combined/`)**:
    *   **Gap**: Page components that orchestrate various UI components and data fetching/display are untested.
    *   **Impact**: Issues with page structure, data flow to components, or overall page behavior might be missed.

4.  **Middleware (`src/middleware.ts`)**:
    *   **Gap**: The Next.js middleware for handling authentication and route protection is untested.
    *   **Impact**: Security vulnerabilities or incorrect routing behavior related to authentication status might not be detected.

5.  **Core Application Logic (To be developed in upcoming tasks)**:
    *   **Scheduling Logic**: Algorithms for booking, checking availability, etc.
    *   **Conflict Detection & Resolution Logic**: Core algorithms for identifying and suggesting resolutions for schedule conflicts.
    *   **Real-time Alert System**: Logic for generating and handling alerts.
    *   **User Management UI & Logic (Admin)**: Frontend and backend logic for administrator user management tasks.
    *   **Impact**: As these features are developed (Tasks 2-7, 9), concurrent test development is crucial.

### 5.2. Test Plan - Prioritized Actions

This plan outlines the general approach to improving test coverage. Specific test cases will be detailed as each feature/module is developed or refactored.

1.  **Database Layer (`src/lib/db.ts`) Tests (High Priority - Task 9)**:
    *   **Action**: Create `src/lib/db.test.ts`.
    *   **Type**: Integration tests using an in-memory SQLite instance.
    *   **Scope**: Test each CRUD function for all entities (`Apartment`, `User`, `Appliance`, `ScheduleEntry`, `Conflict`). Verify data insertion, retrieval, updates, deletions, foreign key constraints, and error handling.
    *   **Goal**: Ensure the database interaction layer is reliable.

2.  **Critical UI Components (High Priority - Concurrent with Tasks 3, 4, 7)**:
    *   **Action**: Create `.test.tsx` files for key scheduling and user management UI components as they are built or enhanced.
    *   **Type**: Component tests using React Testing Library.
    *   **Scope**: Test rendering based on props/state, user interactions (clicks, form submissions), and calls to backend services (mocked).
    *   **Initial Focus**: `ScheduleGrid.tsx`, `CombinedScheduleView.tsx`, core forms for user and schedule management.

3.  **Middleware (`src/middleware.ts`) Tests (Medium Priority - Task 2)**:
    *   **Action**: Create `src/middleware.test.ts`.
    *   **Type**: Unit/Integration tests using mock request/response objects.
    *   **Scope**: Test authentication checks, redirection logic for protected routes, and handling of JWTs.

4.  **Page Level Integration Tests (Medium Priority - Concurrent with UI development)**:
    *   **Action**: Create tests for main page components in `src/app/`.
    *   **Type**: Integration tests with React Testing Library.
    *   **Scope**: Test page rendering with child components, basic data flow, and key user interactions on the page.

5.  **Business Logic for Core Features (High Priority - Concurrent with Tasks 3, 4, 5, 6, 7)**:
    *   **Action**: Create dedicated test files for new modules implementing scheduling logic, conflict detection, alert systems, etc.
    *   **Type**: Primarily unit tests, with integration tests for complex interactions.
    *   **Scope**: Test algorithms, edge cases, and integration points with the database or other services.

### 5.3. Ongoing Process

*   **New Features**: All new features (as per Task Master AI tasks) must include corresponding unit and integration tests.
*   **Bug Fixes**: When a bug is fixed, a regression test should be added to prevent it from recurring.
*   **Coverage Review**: Regularly review `npm run test` coverage reports to identify new gaps.
*   **Thresholds**: Gradually increase global coverage thresholds in `jest.config.js` as coverage improves.

This plan will be revisited and updated as the project progresses and new features are implemented or existing ones are refactored.
