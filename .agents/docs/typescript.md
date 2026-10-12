# TypeScript Conventions

## Strictness
- Keep TypeScript strict mode enabled when configured in the project.
- Avoid `any`; prefer a specific type or `unknown` with appropriate narrowing.
- Do not use `@ts-ignore`. Use `@ts-expect-error` only with a comment explaining why it is necessary.
- Avoid type assertions (`as`) when a type guard or better type definition can solve the problem.
- Do not silence TypeScript errors just to make the build pass.

## Types vs Interfaces
- Use `interface` for object contracts that may be extended.
- Use `type` for unions, intersections, aliases, and computed types.

```ts
interface User {
  id: string;
  name: string;
}

type UserRole = "admin" | "member" | "guest";
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

## React Props

```tsx
interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({ children, disabled = false, onClick }: ButtonProps) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
```

## Naming
- Components, types, and interfaces: `PascalCase`.
- Variables, functions, and hooks: `camelCase`.
- Custom hooks start with `use`, for example `useTheme`.
- Use `.tsx` for files containing JSX and `.ts` for TypeScript files without JSX.

## Exports and Comments
- Prefer named exports unless the framework or existing project conventions require default exports.
- Add comments when they explain non-obvious behavior, constraints, or design decisions.
- Avoid comments that merely repeat what the code does.
- Follow existing project conventions instead of renaming or rewriting unrelated files.
