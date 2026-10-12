# React + Tailwind CSS Frontend

## Tech Stack
- React
- HTML/JSX
- Tailwind CSS
- JavaScript, unless this repository already uses TypeScript
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
├── components/       # Reusable UI components
├── pages/            # Page-level views, if used
├── hooks/            # Reusable custom React hooks
├── assets/           # Assets imported by source code
├── App.jsx           # Root application component
├── main.jsx          # React entry point
└── index.css         # Global styles and Tailwind entry
public/               # Static files served directly
```

Read `.agents/docs/architecture.md` for file placement rules. This is a recommended structure, not a reason to restructure an existing app automatically.
