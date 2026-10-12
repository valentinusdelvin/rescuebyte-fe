# Security

## User Input
- Treat user input and API data as untrusted.
- Validate input before using it in application logic or sending it to the backend.
- Do not render untrusted strings as HTML.
- Avoid `dangerouslySetInnerHTML`. If HTML rendering is truly required, obtain approval and sanitize it with an established sanitizer.
- Never use `eval()` or `new Function()`.

## Safe Rendering Example

```jsx
// React renders this value as text.
<p>{userInput}</p>

// Avoid rendering untrusted HTML:
// <div dangerouslySetInnerHTML={{ __html: userInput }} />
```

## Secrets and Environment Variables
- Never hardcode passwords, API keys, tokens, or private credentials.
- Front-end environment variables can be exposed in the browser bundle. Never put server secrets in client-side variables.
- Do not commit `.env` files or credentials.
- Keep only safe, non-secret configuration in client-side environment variables.

## API and Authentication
- Follow the backend's authentication and session contract.
- Do not store access tokens in `localStorage` unless the project's approved architecture explicitly requires it.
- Handle API errors without exposing secrets or sensitive user information.
- Ask before changing authentication or security-sensitive behavior.
