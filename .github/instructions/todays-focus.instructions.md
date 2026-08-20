---
name: "Today's Focus Project Guidelines"
description: "Use when modifying this React, TypeScript, Vite, or CSS project, including UI components, application behavior, styling, and project scripts."
applyTo: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.css", "*.html", "*.config.*"]
---
# Today's Focus Guidelines

- Use React with TypeScript and preserve the existing Vite entry points and project structure unless a change requires otherwise.
- Keep component logic in `.tsx` files and colocate component-specific styles in the existing CSS files. Reuse the CSS custom properties in `src/index.css` before adding new tokens.
- Keep UI responsive and keyboard accessible. Use semantic HTML, visible focus states, appropriate labels, and buttons for actions.
- The React Compiler is enabled. Do not add `useMemo`, `useCallback`, or memoization wrappers by default; add them only when a measured or documented integration requires them.
- Prefer small, focused components and typed props. Avoid introducing a state-management library or UI framework for local state or presentational needs.
- Preserve the current ESLint and TypeScript configuration. Avoid suppressing rules with `any`, broad eslint disables, or unexplained type assertions.
- Use pnpm for dependency and script commands. Before finishing source changes, run `pnpm lint` and `pnpm build` when the relevant tooling is available.
- Keep changes focused on the requested behavior and avoid modifying generated output such as `dist/`.
- When adding new dependencies, ensure they are actively maintained, have a permissive license, and are necessary for the requested behavior. Avoid adding large libraries for small features.
- Use tailwindcss for styling and avoid adding new CSS frameworks. Use the existing utility classes and extend them only when necessary.
- Use IndexedDB for storage and caching of data. Avoid using localStorage or sessionStorage for large datasets or sensitive information.
- There will be no backend server or API for this project. All data should be stored and managed on the client side using IndexedDB or other browser storage mechanisms.
- Always ask clarifying questions if the requested behavior is unclear or if there are multiple ways to implement it. Avoid making assumptions about the requirements.
- Ask before making any technical decisions that could affect the overall architecture, performance, or maintainability of the project.

