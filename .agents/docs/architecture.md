# Architecture & Folder Structure

## Recommended Structure

```text
src/
├── components/       # Reusable UI components
│   ├── Header.jsx
│   ├── Button.jsx
│   └── FolderCard.jsx
├── pages/            # Page-level components
│   ├── Home.jsx
│   └── About.jsx
├── hooks/            # Reusable custom React hooks
│   └── useTheme.js
├── assets/           # Images/icons imported by source code
├── App.jsx           # Root application component
├── main.jsx          # React entry point
└── index.css         # Global styles and Tailwind entry
public/               # Static files served directly
```

## Placement Rules
- Put reusable UI such as `Button.jsx`, `Header.jsx`, and `FolderCard.jsx` in `src/components/`.
- Put page-level views such as `Home.jsx` and `About.jsx` in `src/pages/`, if the project uses page components.
- Put reusable stateful logic in custom hooks under `src/hooks/`; name them with the `use` prefix.
- Put assets imported by JavaScript/JSX in `src/assets/`.
- Put files that must be served unchanged at a public URL in `public/`.
- Keep `App.jsx` responsible for composing the application; keep `main.jsx` responsible for mounting React.
- Keep global styles and the Tailwind entry/import in `src/index.css`.
- Do not create folders just for the sake of abstraction. Add folders when the project needs them.
- Follow the existing project structure if it differs from this example. Do not reorganize an existing project without a clear reason.

## React Component Example

```jsx
// src/components/FolderCard.jsx
export function FolderCard({ title, description }) {
  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </article>
  );
}
```

- Use function components and React hooks.
- Use stable `key` values when rendering lists.
- Do not mutate React state directly.
- Follow the Rules of Hooks.
- Avoid unnecessary effects and abstractions.
- Handle loading, error, empty, and success states for asynchronous UI.
