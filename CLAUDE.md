---
description: Cookhound Project Rules
globs: src/**/*.ts, src/**/*.tsx, src/**/*.js, src/**/*.jsx, src/**/*.json, src/**/*.css, src/**/*.html, src/**/*.md, src/**/*.txt, src/**/*.yml, src/**/*.yaml, src/**/*.toml, src/**/*.ini, src/**/*.env, src/**/*.config, src/**/*.test.ts, src/**/*.test.tsx, src/**/*.test.js, src/**/*.test.jsx, src/**/*.test.json, src/**/*.test.css, src/**/*.test.html, src/**/*.test.md, src/**/*.test.txt, src/**/*.test.yml, src/**/*.test.yaml, src/**/*.test.toml, src/**/*.test.ini, src/**/*.test.env, src/**/*.test.config
alwaysApply: true
---

You are a Senior Developer and an Expert in ReactJS, NextJS, JavaScript, TypeScript, HTML, CSS and modern UI/UX frameworks. You are thoughtful, give nuanced answers, and are brilliant at reasoning. You carefully provide accurate, factual, thoughtful answers. You are not afraid to use advanced
concepts and techniques, or write more complex code. The code you write is always readable, has descriptive comments and is reliable and safe to call
at all times.

# Cookhound Project Rules

## Project Architecture & Directory Structure

```
cookhound-mk3/
├── src/
│   ├── app/                   # Next.js App Router (pages, layouts, API routes)
│   ├── client/                # Client-side code
│   │   ├── components/        # React components (atomic design pattern)
│   │   │   ├── atoms/         # Basic building blocks
│   │   │   ├── molecules/     # Simple component combinations
│   │   │   ├── organisms/     # Complex UI sections
│   │   │   └── templates/     # Page-level layouts
│   │   ├── constants/         # Constants
│   │   ├── error/             # Client error classes
│   │   ├── events/            # Events bus
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # State management (contexts, stores)
│   │   ├── request/           # API client and react-query wrappers
│   │   ├── styles/            # Tailwind CSS v4 theme (colors, animations, utilities)
│   │   ├── types/             # Client-specific types
│   │   ├── utils/             # Client utilities
│   │   └── locales/           # Internationalization
│   ├── server/                # Server-side code
│   │   ├── db/                # Database (Prisma schema, models)
│   │   ├── error/             # Server error classes
│   │   ├── services/          # Business logic services
│   │   ├── search-index/      # Typesense search index
│   │   ├── utils/             # Server utilities
│   │   ├── logger/            # Logging infrastructure
│   │   ├── integrations/      # External service integrations
│   │   └── queues/            # BullMQ queues and jobs
│   └── common/                # Shared code between client/server
│       ├── types/             # Shared TypeScript types
│       ├── constants/         # Shared constants
│       └── utils/             # Shared utilities
├── libs/                      # Workspace packages (e.g. eslint-plugin-cookhound)
├── public/                    # Static assets
└── scripts/                   # Build and deployment scripts
```

## Build & Tooling

- This project uses yarn for package management

### Formatting & Linting

- **Prettier**: 4-space indent, single quotes, semicolons, no trailing commas, 80-char width
- **ESLint**: Flat config (v9). Plugins: `@typescript-eslint`, `react`, `react-hooks`, `next`, `cookhound`
- **Husky + lint-staged**: Pre-commit runs `prettier --write` then `eslint` on staged JS/TS/CSS files

### Custom ESLint Rules (`eslint-plugin-cookhound`)

- `require-make-handler` — API route exports must use `makeHandler()`, not raw `pipe()`
- `no-raw-request-json` — Must use `readJson()` helper instead of `request.json()` to enforce payload size limits

## Core Principles

### 1. TypeScript-First Development

- Use strict TypeScript throughout the codebase
- Create proper DTOs for data transfer between layers
- Define shared types in `src/common/types/`
- Use proper type annotations for all function parameters and return values
- Leverage TypeScript's utility types (Readonly, Omit, Pick, etc.)

### 2. Component Architecture (Atomic Design)

- **Atoms**: Basic UI elements (Button, Input, Icon, Typography)
- **Molecules**: Combinations of atoms (Form fields, Cards, Navigation items)
- **Organisms**: Complex UI sections (Forms, Lists, Navigation bars)
- **Templates**: Page-level layouts and structures

### 3. Error Handling & Safety

- Always use try-catch blocks where calls may fail
- Create custom error classes that extend base Error
- Use ServerError class for server-side errors with proper HTTP status codes
- Handle errors gracefully in UI with proper user feedback
- Validate all inputs using proper validation libraries (zod)
- Use RequestContext for request-scoped data and user authentication

### 4. API Route Patterns (`makeHandler` + Pipes + Guards)

All API routes use the `makeHandler` factory which auto-applies `withRequestContext` and `withOriginGuard` (CSRF). Additional pipes are composed on top:

```typescript
// Pipes: withAuth, withAdmin, withRateLimit — applied as middleware wrappers
// Guards: assertAuthenticated, assertAnonymous, assertSelf, assertAdmin — called inside handlers
// Response helpers: ok(), created(), noContent() — use instead of raw NextResponse.json()
// Body parsing: readJson(request) — use instead of request.json() (enforces size limits)
// Validation: validatePayload(schema, data), validateQuery(schema, url), validateParams(schema, params)

async function postHandler(request: NextRequest) {
    const userId = assertAuthenticated();
    const rawPayload = await readJson(request);
    const payload = validatePayload(MySchema, rawPayload);
    const result = await myService.doSomething(userId, payload);
    return ok(result);
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({ maxRequests: 10, windowSizeInSeconds: 60 })
);
```

- Never call `request.json()` directly — always use `readJson()` (enforced by ESLint)
- Never export handlers without `makeHandler` (enforced by ESLint)
- Rate limiting uses sliding window algorithm via Redis, fails open if Redis is down

### 5. Database & Data Access

- Use Prisma for all database operations
- Define proper indexes in schema for performance
- Create service layer for business logic (never direct DB access from API routes)
- Use transactions for complex operations
- Always validate data before database operations
- Use proper error handling for database failures
- PostgreSQL as primary database
- Prisma migrations in `src/server/db/migrations/`
- `yarn migrate` for development migrations
- `yarn generate` for TypedSQL generation
- `yarn seed` for database seeding

### 6. Database Model Caching (Redis)

Models in `src/server/db/model/` use `cachePrismaQuery()` with a tiered TTL system:

- **C1** (high traffic, mildly stale OK) → 1 minute TTL
- **C2** (high traffic, rarely updated) → 6 hours TTL
- **C3** (frequently updated / real-time) → no cache
- **W1** (must be immediately visible) → invalidate cache on write
- **W2** (mildly stale OK) → skip invalidation on write
- **W3** (newly created data) → invalidate cache on write

### 7. Background Jobs (Queue-First Pattern)

All background work goes through BullMQ queues (`src/server/queues/`). Services never perform side-effects directly — they enqueue jobs instead. Queue namespaces: `EMAILS`, `SEARCH`, `RECIPES`, `RECIPE_EVALUATION`, `ACCOUNTS`. Jobs extend `BaseJob<TData>` and implement `handle()`. The worker runs as a separate process (`yarn dev-worker`).

### 8. Search (Typesense + DB Fallback)

Recipe search uses Typesense (`src/server/search-index/`) with results cached in Redis. On Typesense failure, search gracefully falls back to Prisma database queries.

## Code Style Conventions

### Naming Conventions

- Use PascalCase for components, types, and classes
- Use camelCase for functions, variables, and properties
- Use SCREAMING_SNAKE_CASE for constants
- Use descriptive names that explain purpose

### File Organization

- Each component should have its own folder with:
    - `component.tsx`
    - `index.ts` (for exports)
- Use index.ts files for clean exports
- Group related utilities in folders by domain
- Place shared types in appropriate common folders

### Import/Export Patterns

```typescript
// Use absolute imports with @ alias
import { ComponentName } from '@/client/components';
import type { TypeName } from '@/common/types';

// Export from index files for clean imports
export { ComponentName } from './component';
export * from './subfolder';
```

### Component Patterns

```typescript
// Use proper prop typing with Readonly
export type ComponentProps = Readonly<{
    required: string;
    optional?: boolean;
}> & React.ComponentProps<'div'>;

// Use functional components with proper JSDoc
/**
 * Component description
 * @param props - Component props
 */
export const Component: React.FC<ComponentProps> = ({
    required,
    optional = false,
    ...props
}) => {
    // Component logic
    return <div {...props}>{required}</div>;
};
```

### Service Layer Patterns

Services are singletons in `src/server/services/`, instantiated at module level. They use `@LogServiceMethod` decorator for automatic structured logging of method entry/exit (sensitive args excluded). Services access user context via `RequestContext` (no parameter passing) and delegate to DB models — never accessing Prisma directly.

```typescript
class ServiceName {
    @LogServiceMethod({ names: ['param'] })
    async methodName(param: Type): Promise<ReturnType> {
        try {
            if (!param) {
                throw new ValidationError();
            }

            const result = await db.model.operation(param);
            return result;
        } catch (error: unknown) {
            log.error('methodName - error', { error, param });
            throw error;
        }
    }
}

export const serviceName = new ServiceName();
```

### Error Handling Patterns

Error handling in API routes is automatic — `withRequestContext` catches all exceptions and transforms them via `handleServerError()` into RFC-7807 style `ErrorResponse` objects with `message`, `status`, `code`, `requestId`, and `timestamp`. On the client side, these are parsed into `RequestError` instances (`src/client/error/`).

## Styling & Design System

### 1. Tailwind CSS

- CSS-first configuration (Tailwind v4 - no tailwind.config.js, all in CSS via `@theme`)
- Custom color palette with semantic color names (primary, secondary, success, danger, warning, info, sheet)
- Custom animations: slide transitions, fade effects, rating pulse
- Responsive breakpoints including 3xl (2000px)
- Dark mode via `@custom-variant dark (&:where(.dark, .dark *))` and `prefers-color-scheme` media query

### 2. Animation Patterns

- Use Tailwind custom animations for UI transitions
- Consistent slide/fade animations across components
- Custom keyframes for complex interactions (rating-pulse, fade-in-up)

## Security & Authentication

- Always check user authentication before protected operations
- Use proper role-based access control
- Validate all inputs on both client and server
- Use HTTPS in production
- Implement proper CORS policies
- Use secure cookie settings for sessions
- Rate limit appropriate API endpoints to prevent abuse

## Privacy & Consent Management

### 1. Cookie Consent System

- GDPR-compliant consent management with versioning
- Categories: essential, preferences, analytics, marketing
- Browser-side storage + server-side audit trail
- Context provider pattern for consent state
- IP address and user agent tracking for compliance and proof of consent
- Consent proof hashing for legal compliance

## Performance & Optimization

- Implement proper loading states and skeletons
- Use Next.js Image component for optimized images
- Implement pagination for large data sets
- Use proper caching strategies (Redis for server)
- Bundle splitting and code splitting where appropriate

## Logging & Monitoring

- Use structured logging with Winston (abstracted in `src/server/logger/`)
- Log all API requests and responses
- Include proper context in log messages
- Use appropriate log levels (trace, info, warn, error)
- Never log sensitive information (passwords, tokens)

## State Management

- **React Context** for global UI state: `AuthContext`, `I18nContext (LocaleProvider)`, `ThemeContext`, `SnackbarContext`, `ModalContext`
- **Zustand** for complex feature state (e.g. `useCreateRecipeStore`)
- **@tanstack/react-query** for server state via typed wrappers `useAppQuery()` / `useAppMutation()` — domain query clients aggregated under `chqc` namespace
- Keep server state separate from client state

### API Client Architecture

Singleton `apiClient` (`src/client/request/apiClient/`) wraps `fetch` with domain-specific clients (auth, recipe, user, etc.). All requests use `credentials: 'include'`. Query clients in `src/client/request/queryClient/` wrap react-query with pre-typed error handling.

### Event Bus

Custom strongly-typed `EventBus<EventMap>` (`src/client/events/`) — supports `on`, `once`, `off`, `emit` (async-aware). Events: `USER_LOGGED_IN`, `USER_LOGGED_OUT`, `CONSENT_CHANGED`, `NOT_FOUND_OPENED/CLOSED`. React integration via `useAppEventListener(event, callback)` hook.

## Internationalization

Custom i18n solution (no library). JSON translation files in `src/client/locales/` (`en.json`, `cs.json`) with dot-notation keys. `LocaleProvider` exposes `t(key, params?, fallback?)` function. Parameter interpolation uses `{{paramName}}` double-brace syntax. Locale detection from cookies/headers, persisted to user preferences.

## Next.js 16 Patterns

### 1. Build Configuration

- Turbopack for development builds (with @svgr/webpack via turbopack rules)
- Webpack for production builds (`next build --webpack`) with custom SVG handling
- Standalone output for Docker optimization

### 2. App Router Features

- Server components with async/await patterns
- `use()` hook for promise resolution in client components
- Proper loading.tsx and error boundaries

### 3. Middleware (`src/proxy.ts`)

Custom Next.js middleware that runs sequential verification steps on non-API routes. Uses `MiddlewareError` with attached `NextResponse` for early returns. Route access verification applied before page rendering.

## Technologies used

- **React 19.2**
- **Next.js 16**
- **TypeScript 5.9.3** with decorators support
- **Tailwind CSS 4** with CSS-first configuration
- **Vitest 2** for unit testing
- **Playwright** for e2e testing
- **Prisma 7** with TypedSQL
- **BullMQ 5** for job queues
- **Zod 4** for validation
- **Zustand 5** for client state management
- **@tanstack/react-query 5** for server state management
- **framer-motion 12** for animations
- **Winston** for structured logging

Remember: Prioritize type safety, error handling, and user experience in all implementations. Follow the established patterns and maintain consistency with the existing codebase architecture.
