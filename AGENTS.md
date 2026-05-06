You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Angular Skills

This project includes specialized skills that MUST be used for specific tasks. Use the `skill` tool to load them:

- **angular-developer**: For Angular code generation, components, services, signals, dependency injection, routing, SSR, accessibility, animations, styling, testing, or CLI tooling. Also use for architectural guidance on patterns like ports/adapters, clean architecture, use cases, domain layer, application layer, infrastructure, presentation.
- **angular21-architecture**: Enterprise architecture for Angular 21+ projects with hexagonal architecture, DDD, Signals, standalone components, OnPush and zoneless.
- **tailwind-css-patterns**: For utility-first styling, responsive design, layout utilities, flexbox, grid, typography, colors.
- **accessibility**: For WCAG 2.2 audits, screen reader support, keyboard navigation, ARIA attributes.
- **seo**: For search engine optimization, meta tags, structured data, sitemaps.
- **git-commit**: For creating conventional commits with intelligent staging and message generation.
- **vitest**: For Vitest unit testing, mocking, coverage configuration.
- **nodejs-backend-patterns**: For Node.js backend services, REST APIs, GraphQL backends, microservices.
- **typescript-advanced-types**: For complex TypeScript types, generics, conditional types, mapped types.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
