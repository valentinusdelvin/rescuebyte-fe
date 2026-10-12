# Git Conventions

## Branch Naming

```text
feat/add-home-page
fix/mobile-navigation
docs/update-readme
refactor/reusable-card
```

Use a ticket ID in branch names if the team uses a ticketing system.

## Commit Messages
Use Conventional Commits when the project/team follows this convention:

```text
feat: add home page
fix: correct mobile navigation
docs: update setup instructions
refactor: extract reusable card
test: add component tests
chore: update dependencies
```

## Rules
- Keep each commit focused on one logical change.
- Review diffs before committing.
- Never commit `.env` files, credentials, `node_modules/`, or generated build output.
- Do not force-push shared branches.
- Do not commit or push unless asked or explicitly approved.
- The developer remains responsible for reviewing AI-generated changes.
