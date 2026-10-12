# AGENTS.md — Project Rules

## Project Overview
- Read `README.md` to understand the project, tech stack, scripts, and folder structure.
- Follow the existing implementation and conventions.
- Inspect relevant files before making changes.

## Required Guidelines
Read the relevant guidelines in `.agents/docs/` before modifying code:
- `architecture.md` — folder placement, module boundaries, and component organization.
- `typescript.md` — typing, naming, and TypeScript conventions.
- `styling.md` — styling, responsive design, and design tokens.
- `api.md` — API communication, data fetching, and error handling.
- `security.md` — authentication, input validation, and secrets.
- `git.md` — branching, commits, and pull requests.

Always follow `security.md` for security-sensitive changes.

## Development Workflow
- Make the smallest change that satisfies the requirement.
- Reuse existing components, utilities, and patterns.
- Do not introduce new dependencies or architectural patterns without a clear reason.
- Preserve existing behavior unless explicitly asked to change it.
- Update tests when changing behavior and run relevant project checks.
- Never claim tests, builds, or checks passed without verifying them.


## Safety Guardrails (Critical)
- Never write to the database without explicit user confirmation
- Never deploy to any environment without explicit approval
- Never delete files without explicit user confirmation
- Never commit `.env`, `.env.local`, or any file containing secrets
- Never hardcode credentials, API keys, or tokens
- Validate all user input before processing
- Wrap all external API calls in try/catch with proper error handling

## Communication
- Be concise — skip explanations of basic concepts
- When suggesting a change, explain the 'why', not just the 'what'
- If you notice a potential bug while working on something else, stop and flag it
- Always suggest the simplest solution that meets the requirements
- When uncertain about intent, ask rather than guessing