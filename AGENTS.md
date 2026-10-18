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

## Project Context
- This project is the RescueByte frontend application.
- RescueByte focuses on food rescue, affordable surplus food, and food redistribution.
- Follow the product requirements in `prd.md` and the visual specifications in `design.md`.
- Do not invent product features, user flows, or business rules that are not supported by the PRD or explicitly requested.

## Product and Design References
Before implementing a new feature or making significant UI changes:

- Read `prd.md` to understand the required features, user flows, and acceptance criteria.
- Read `design.md` to understand the design system, colors, typography, spacing, component styles, and responsive behavior.
- Read the relevant guides in `.agents/docs/` before making technical changes.
- Treat `prd.md` as the source of truth for product requirements and `design.md` as the source of truth for visual design.
- Reuse the established design tokens and existing components instead of introducing arbitrary styles.
- If the PRD, design specifications, and existing implementation conflict, explain the conflict and ask for clarification when it materially affects the result.

## UI Implementation Rules

- Build interfaces that are consistent with the RescueByte design system.
- Use reusable React components and TypeScript types consistent with the existing architecture.
- Include appropriate loading, empty, error, disabled, and success states when relevant.
- Follow accessibility practices for semantic HTML, keyboard navigation, focus indicators, and readable contrast.
- Do not replace the established visual direction with a generic template or introduce unrelated UI elements.
- Before considering a UI task complete, verify that the implementation matches `design.md` and the requested behavior.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->
