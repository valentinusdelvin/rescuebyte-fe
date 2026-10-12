# Styling — Tailwind CSS

## Main Rules
- Use Tailwind CSS utility classes for layout, spacing, typography, colors, and responsive styling.
- Follow the installed Tailwind CSS version and existing setup. Do not mix configuration patterns from different major versions.
- Keep design choices consistent; reuse existing colors, spacing, and components.
- Use responsive utilities such as `sm:`, `md:`, `lg:`, and `xl:` when needed.
- Prefer component reuse over repeating large blocks of markup.
- Avoid inline `style` props for static styling. Dynamic values may use inline styles when necessary.
- Avoid `!important` and conflicting utility classes.
- Respect reduced-motion preferences for non-essential animation.
- Do not add styling or animation dependencies without a clear need.

## Example: React + Tailwind

```jsx
export function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white transition
                 hover:bg-blue-700 focus-visible:outline-2
                 focus-visible:outline-offset-2"
    >
      {children}
    </button>
  );
}
```

Use the example as a style reference, not as a requirement to use this exact color or component.

## HTML and Accessibility
- Use semantic elements such as `header`, `nav`, `main`, `section`, and `footer`.
- Use `button` for actions and `a` for navigation.
- Associate form fields with labels.
- Ensure keyboard focus is visible and text has readable contrast.
- Add useful alternative text to meaningful images; use empty alt text for decorative images.
