# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

**Development:**
- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase using Next.js's default linter.

**Testing (using Vitest):**
- `npm run test`: Runs all tests.
- `npm run test:watch`: Runs tests in watch mode.
- `npm run test:coverage`: Runs tests and generates a coverage report.
- `npm run test:ui`: Runs tests with the Vitest UI.
- `npm run test:update`: Updates test snapshots.

## Code Architecture and Structure

This is a Next.js application, described in the README.md as a "NextJS starter in Firebase Studio." The main entry point for the application pages is `src/app/page.tsx`.

**Key directory structure:**
- `src/app/`: Contains the Next.js App Router pages and layouts.
  - `(app)/`: Main application routes (e.g., `dashboard`, `schedule`, `admin`).
  - `(auth)/`: Authentication related routes (e.g., `login`).
  - `api/`: API routes for backend functionality.
- `src/components/`: Reusable React components, including UI elements and layout components like `AppNavbar.tsx`.
- `src/contexts/`: React context providers for global state management (e.g., `AuthContext.tsx`, `ScheduleContext.tsx`).
- `src/hooks/`: Custom React hooks for reusable logic (e.g., `useAuth.ts`, `useSchedule.ts`).
- `src/lib/`: Core utility functions, database interaction (`db.ts`), authentication logic (`auth.ts`), and migrations.
- `src/web-components/`: Custom web components and their registration logic.

The application uses Next.js for routing and server-side rendering, Tailwind CSS for styling, and Vitest for testing.

## Development Workflow using Task Master

This project utilizes a "Task Master" system for managing development tasks, as detailed in `.cursor/rules/dev_workflow.mdc` and `.cursor/rules/taskmaster.mdc`. For AI agents and integrated development environments (like Cursor), interacting via the **MCP server is the preferred method**. The `task-master` CLI is available for direct user interaction or as a fallback.

**Core Workflow:**

1.  **Initialization**:
    *   New projects might start with `task-master init` (MCP: `initialize_project`) or `task-master parse-prd --input='<prd-file.txt>'` (MCP: `parse_prd`) to generate an initial `tasks.json` from a Product Requirements Document.
2.  **Understanding Current State**:
    *   `task-master list` (MCP: `get_tasks`): View current tasks, statuses, and IDs.
    *   `task-master next` (MCP: `next_task`): Determine the next available task based on dependencies and priority.
    *   `task-master show <id>` (MCP: `get_task`): View detailed information for a specific task.
3.  **Task Breakdown & Planning**:
    *   `task-master analyze-complexity --research` (MCP: `analyze_project_complexity`): Analyze task complexity.
    *   `task-master complexity-report` (MCP: `complexity_report`): Review the complexity analysis.
    *   `task-master expand --id=<id> --research` (MCP: `expand_task`): Break down a complex task into subtasks. Use `--force` to replace existing subtasks.
    *   `task-master clear-subtasks --id=<id>` (MCP: `clear_subtasks`): Clear existing subtasks if a complete re-generation is needed.
4.  **Implementation & Progress Logging**:
    *   As you work on a subtask, iteratively log your plan, findings, and code changes:
        `task-master update-subtask --id=<subtaskId> --prompt='<detailed plan/update>'` (MCP: `update_subtask`).
    *   This creates a timestamped log within the subtask's details.
5.  **Task Status Updates**:
    *   `task-master set-status --id=<id> --status=<status>` (MCP: `set_task_status`): Mark tasks as `pending`, `in-progress`, `done`, etc.
6.  **Adapting to Changes**:
    *   `task-master update --from=<taskId> --prompt='<context>' --research` (MCP: `update`): Update multiple upcoming tasks based on new context.
    *   `task-master update-task --id=<taskId> --prompt='<context>' --research` (MCP: `update_task`): Update a single specific task.
7.  **Adding New Tasks**:
    *   `task-master add-task --prompt='<description>' --research` (MCP: `add_task`).
    *   `task-master add-subtask --parent=<id> --title='<title>'` (MCP: `add_subtask`).
8.  **Dependency Management**:
    *   Use `add_dependency`, `remove_dependency`, `validate_dependencies`, and `fix_dependencies` tools/commands.
9.  **Configuration**:
    *   AI models and other settings are configured in `.taskmaster/config.json` (managed via `task-master models --setup` or the `models` MCP tool).
    *   API keys are stored in a `.env` file (for CLI) or `.cursor/mcp.json` (for MCP integration).

For a comprehensive list of commands and their options, refer to `.cursor/rules/taskmaster.mdc`. The overall development process is outlined in `.cursor/rules/dev_workflow.mdc`.
