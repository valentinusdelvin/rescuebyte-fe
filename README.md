# React + TypeScript + Tailwind CSS Frontend

## Tech Stack
- React
- TypeScript (`.ts` and `.tsx`)
- HTML/JSX via TSX
- Tailwind CSS
- Build tool and package manager: follow the existing `package.json` and lockfile.

## Getting Started
Use the package manager already configured in the repository. Check `package.json` before assuming script names.

Common examples, only if defined in `package.json`:

```bash
npm install
npm run dev
npm run build
```

## Example Project Structure

```text
src/
├── components/       # Reusable UI components (.tsx)
├── pages/            # Page-level views, if used (.tsx)
├── hooks/            # Reusable custom React hooks (.ts)
├── types/            # Shared TypeScript types, if needed
├── assets/           # Assets imported by source code
├── App.tsx           # Root application component
├── main.tsx          # React entry point
└── index.css         # Global styles and Tailwind entry
public/               # Static files served directly
```

Read `.agents/docs/architecture.md` for file placement rules. This is a recommended structure, not a reason to restructure an existing app automatically.

## Development Notes
- Follow `AGENTS.md` and the relevant guides in `.agents/docs/`.
- Use TypeScript strictly and avoid `any`.
- Prefer existing components, utilities, and project patterns before adding new ones.
- Check `package.json` for available development, build, lint, and test scripts.
