# AGENTS.md — React + Tailwind CSS Project Rules

## Project Overview
- Build and maintain a React web application using TypeScript/TSX and Tailwind CSS.
- Follow the actual dependencies, scripts, and lockfile in this repository.
- Inspect the existing project before making changes.
- The recommended folder structure is documented in `.agents/docs/architecture.md`.

## Guidelines
Read the relevant guide before making changes:
- `.agents/docs/architecture.md` — folder structure and component placement.
- `.agents/docs/typescript.md` — TypeScript typing and conventions.
- `.agents/docs/styling.md` — Tailwind CSS, responsive UI, and accessibility.
- `.agents/docs/security.md` — safe handling of user input and secrets.
- `.agents/docs/api.md` — API calls, if the project connects to a backend.
- `.agents/docs/git.md` — Git and commit conventions.

Always follow `security.md` for security-sensitive changes.

## Development Workflow
- Make the smallest change that satisfies the request.
- Reuse existing components and patterns.
- Do not add dependencies or introduce a new architecture without a clear reason.
- Preserve existing behavior unless a change is requested.
- Run available lint, build, and test scripts when relevant. Never claim they passed without running them.
- Ask before destructive changes, deleting files, deploying, or performing other irreversible operations.

## Communication
- Explain significant changes and why they are needed.
- Report which files changed and which checks were run.
- Ask rather than guess when requirements are ambiguous.
- Prefer the simplest maintainable solution.
