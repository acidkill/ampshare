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

*(This section will be populated by Task 1.5)*
