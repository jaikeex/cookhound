---
description: Cookhound Project Rules
globs: src/**/*.ts, src/**/*.tsx, src/**/*.js, src/**/*.jsx, src/**/*.json, src/**/*.css, src/**/*.html, src/**/*.md, src/**/*.txt, src/**/*.yml, src/**/*.yaml, src/**/*.toml, src/**/*.ini, src/**/*.env, src/**/*.config, src/**/*.test.ts, src/**/*.test.tsx, src/**/*.test.js, src/**/*.test.jsx, src/**/*.test.json, src/**/*.test.css, src/**/*.test.html, src/**/*.test.md, src/**/*.test.txt, src/**/*.test.yml, src/**/*.test.yaml, src/**/*.test.toml, src/**/*.test.ini, src/**/*.test.env, src/**/*.test.config
alwaysApply: true
---

You are a Senior Developer and an Expert in ReactJS, NextJS, JavaScript, TypeScript, HTML, CSS and modern UI/UX frameworks. You are thoughtful, give nuanced answers, and are brilliant at reasoning. You carefully provide accurate, factual, thoughtful answers. You are not afraid to use advanced
concepts and techniques, or write more complex code. The code you write is always readable, has descriptive comments (but do not overdo this, self-explanatory code does not need to be commented) and is reliable and safe to call
at all times.

# Cookhound Project Rules

## Version Control — Hands Off Git

**The developer owns the repository state. Never mutate it without explicit permission.**

Do **not** run, unprompted, any command that changes tracked history, the index, or the working tree:

- `git add` / `git rm` / `git restore` / `git checkout <path>` — the developer curates the staging area himself
- `git commit` (including `--amend`), `git revert`, `git reset`, `git stash`
- `git push`, `git pull`, `git merge`, `git rebase`, `git cherry-pick`, `git tag`
- `git branch` / `git switch -c` — do not create, rename, or delete branches
- `gh pr create` and any other command that publishes to the remote

Read-only inspection is always fine and encouraged — `git status`, `git diff`, `git log`, `git show`, `git blame`, `git ls-files`, `git stash list`. Use these freely to understand a change before working on it.

**Implicit permission** exists only when the task *is* a git task. If the developer asks you to resolve merge conflicts, bisect a regression, fix a botched rebase, or clean up a branch, the write commands needed to carry that out are authorized by the request itself. Even then, prefer the least destructive option available, and say what you are about to do before running anything irreversible (`reset --hard`, `push --force`, history rewrites).

Everything else — staging, committing, pushing, branching, releasing — is the developer's job. If a change is finished and would normally be committed, simply say so and stop.

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
│   │   ├── data/              # Client data layer (ports, adapters, query hooks)
│   │   ├── request/           # API client (HTTP transport) and react-query wrappers
│   │   ├── styles/            # Tailwind CSS v4 theme (colors, animations, utilities)
│   │   ├── types/             # Client-specific types
│   │   ├── utils/             # Client utilities
│   │   ├── locales/           # Translation messages + t() (Czech-only)
│   │   └── globals.css        # Tailwind entry (imports styles/**)
│   ├── server/                # Server-side code
│   │   ├── db/                # Database (Prisma schema, models, migrations, TypedSQL)
│   │   ├── data/              # Server data layer (serverData — RSC/action access)
│   │   ├── error/             # Server error classes
│   │   ├── services/          # Business logic services
│   │   ├── search-index/      # Typesense search index
│   │   ├── proxy/             # Middleware steps, route policies, redirects
│   │   ├── utils/             # Server utilities (reqwest, api-docs, rate-limit, …)
│   │   ├── logger/            # Logging infrastructure
│   │   ├── integrations/      # External service integrations
│   │   ├── types/             # Server-specific types
│   │   └── queues/            # BullMQ queues and jobs
│   ├── common/                # Shared code between client/server
│   │   ├── types/             # Shared TypeScript types
│   │   ├── constants/         # Shared constants
│   │   └── utils/             # Shared utilities
│   └── proxy.ts               # Next.js middleware entry (runs src/server/proxy steps)
├── libs/                      # Workspace packages (e.g. eslint-plugin-cookhound)
├── prisma/                    # seed.ts + prisma.config.ts target (schema lives in src/server/db)
├── e2e/                       # Playwright specs
├── docs/                      # Long-form project docs (migrations, reviews)
├── deploy/ docker/            # Deployment config (nginx, compose, Dockerfile)
├── public/                    # Static assets
└── scripts/                   # Build and deployment scripts
```

## Build & Tooling

- This project uses yarn (v4, `packageManager` pinned) for package management
- Workspaces: `libs/*`

### Scripts

| Script | Purpose |
| --- | --- |
| `yarn dev` | Next dev server (Turbopack) |
| `yarn dev-worker` | BullMQ worker process (`tsx src/server/queues/runtime/worker.ts`) |
| `yarn build` | `next build --webpack` + standalone static copy |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn lint` | `prettier --write .` then `eslint` (`lint:check` for read-only) |
| `yarn test` | Vitest, single run |
| `yarn test:e2e` | Playwright (`test:e2e:ui` for the UI runner) |
| `yarn migrate` / `generate` / `seed` | Prisma migrate dev / TypedSQL generate / db seed |
| `yarn redis:flush`, `yarn setup-typesense` | Local infra helpers |

### Formatting & Linting

- **Prettier**: 4-space indent, single quotes, semicolons, no trailing commas, 80-char width
- **ESLint**: Flat config (v9). Plugins: `@typescript-eslint`, `react`, `react-hooks`, `@next/next`, `cookhound`
- **Husky + lint-staged**: Pre-commit runs `prettier --write` then `eslint` on staged JS/TS/CSS files

### Custom ESLint Rules (`eslint-plugin-cookhound`)

All four are `error`. Rule sources live in `libs/eslint-plugin-cookhound/rules/`.

- `require-make-handler` — API route exports must use `makeHandler()`, not raw `pipe()`
- `no-raw-request-json` — Must use `readJson()` helper instead of `request.json()` to enforce payload size limits
- `no-raw-cookie-mutation` — Never call `.set()` / `.delete()` / `.clear()` on the `next/headers` `cookies()` store. Use `setCookie()` / `deleteCookie()` from `@/server/utils/reqwest/cookies` so cookie attributes stay centralized (only that module is exempt)
- `require-log-context` — Every `*Service` class in `src/server/services/**/service.ts` must declare `static readonly LOG_CONTEXT`. `@LogServiceMethod` otherwise falls back to the class name, which the production bundler mangles to a single letter

### Other Enforced Rules Worth Knowing

These fail the build, so write code that satisfies them up front:

- `no-restricted-imports` forbids the `../` pattern — **no relative parent imports**, always use the `@/` alias
- `@typescript-eslint/consistent-type-imports` — type-only imports must use `import type`
- `react/jsx-no-bind` — no inline arrow/bound functions in JSX props; hoist to `useCallback` or a named handler
- `react/prefer-read-only-props` — component props must be `Readonly` (matches the Component Patterns example below)
- `react/sort-prop-types`, `react/sort-default-props`, `react/self-closing-comp`, `react/no-danger`
- `@typescript-eslint/no-explicit-any` is **off** — `any` is allowed where genuinely warranted

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

Everything lives under `src/server/utils/reqwest/` (`makeHandler.ts`, `pipes/`, `guards/`, `responses.ts`, `cookies.ts`).

```typescript
// Pipes: withAuth, withAdmin, withRateLimit — applied as middleware wrappers
// Guards (src/server/utils/reqwest/guards/auth.ts) — called inside handlers:
//   assertAuthenticated, assertAnonymous, assertSelf, assertSelfOrAdmin,
//   assertAdmin, assertAdminAndNotSelf
// Response helpers: ok(), created(), noContent() — use instead of raw NextResponse.json()
// Body parsing: readJson(request) — use instead of request.json() (enforces size limits)
// Validation: validatePayload(schema, data), validateQuery(schema, url), validateParams(schema, params)
// Cookies: setCookie() / deleteCookie() — never mutate the cookies() store directly

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

#### Route documentation (`registerRouteDocs`)

Every route file registers its own docs at module scope — 54 of 55 routes do, so treat it as required for new routes. The registry (`src/server/utils/api-docs/`) is rendered by the in-app viewer at `/admin/api-docs`; there is no OpenAPI file to regenerate.

```typescript
registerRouteDocs('/api/contact', {
    category: 'Contact',
    POST: {
        summary: 'Submit a contact form message.',
        description: `Delivers the message to site administrators via email.`,
        auth: AuthLevel.PUBLIC,
        rateLimit: { maxRequests: 3, windowSizeInSeconds: 3600 },
        bodySchema: ContactFormSchema,
        captchaRequired: true,
        clientUsage: [{ apiClient: 'apiClient.contact.submitContactForm' }]
    }
});
```

Keep the docs honest: `auth` must match the pipes/guards actually applied, and `rateLimit` must match the `withRateLimit` config. Path params use `{id}` placeholders in the registered path. The `RouteDocs` type is in `src/common/types/api-docs.ts`.

### 5. Database & Data Access

- Use Prisma for all database operations
- Define proper indexes in schema for performance
- Create service layer for business logic (never direct DB access from API routes)
- Use transactions for complex operations
- Always validate data before database operations
- Use proper error handling for database failures
- PostgreSQL as primary database, reached through `@prisma/adapter-pg`
- Schema at `src/server/db/schema.prisma`, migrations in `src/server/db/migrations/`, TypedSQL queries in `src/server/db/sql/`, generated client in `src/server/db/generated/` (paths wired up in `prisma.config.ts`)
- Query wrappers live in `src/server/db/model/<model>/` — services call these, never Prisma directly
- `yarn migrate` for development migrations — note it hardcodes `--name init`, so pass your own name when the migration deserves one
- `yarn generate` for TypedSQL generation (`prisma generate --sql`)
- `yarn seed` for database seeding (`prisma/seed.ts`)

### 6. Database Model Caching (Redis)

Models in `src/server/db/model/` use `cachePrismaQuery()` with a tiered TTL system:

- **C1** (high traffic, mildly stale OK) → 1 minute TTL
- **C2** (high traffic, rarely updated) → 6 hours TTL
- **C3** (frequently updated / real-time) → no cache
- **W1** (must be immediately visible) → invalidate cache on write
- **W2** (mildly stale OK) → skip invalidation on write
- **W3** (newly created data) → invalidate cache on write

**Invalidation is tag-based, not pattern/scan-based.** Each cached read passes the tags it belongs to as the last arg of `cachePrismaQuery()` (a static list, or a function of the result — e.g. tagging a user fetched by email with `user:{id}`). Each W1/W3 write calls `invalidateTags([...])`, which resolves the tag sets to their member keys and drops them — O(entries actually affected), never a `KEYS`/`SCAN` over the shared keyspace. All tag builders live in one place, `CACHE_TAGS` in `src/server/db/model/model-cache.ts`; that registry is the single point to audit which reads a given write clears. Keep the two sides in lockstep through it: a read tagged with a tag no writer drops only expires on its TTL, and a writer dropping a tag no read registers is a harmless no-op. Tag sets carry `CACHE_TAG_TTL` (24h), which must stay above the largest entry TTL so a tag can never expire while a member it tracks is still cached. Not every cached read needs a tag: high-cardinality C1 collections (e.g. global recipe lists — findMany, front page, search, filter) are deliberately left untagged and rely on their short TTL, since a wide tag is the costliest to drop on every write while buying at most one TTL window of freshness. Tag a read only when a write genuinely needs to make it fresh sooner than its TTL.

### 7. Background Jobs (Queue-First Pattern)

All background work goes through BullMQ queues (`src/server/queues/`). Services never perform side-effects directly — they enqueue jobs instead. Queue namespaces (`QUEUE_NAMES` in `src/server/queues/jobs/names.ts`): `EMAILS`, `SEARCH`, `RECIPES`, `RECIPE_EVALUATION`, `ACCOUNTS`, `NOTIFICATIONS`. Jobs extend `BaseJob<TData>`, declare `static queueName`, and implement `handle()`. The worker runs as a separate process (`yarn dev-worker`) under `tsx`, so it must not import Next request-runtime modules — see the barrel-decoupling constraint in the worker entry.

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
import type { TypeName } from '@/common/types';

// Export from index files for clean imports
export { ComponentName } from './component';
export * from './subfolder';
```

#### Component imports: deep paths, not the barrel

Inside `src/client/components/**`, import components from their own
module path, **not** from the `@/client/components` barrel (nor the
`atoms`/`molecules`/`organisms` sub-barrels):

```typescript
// Do this, deep, module-specific import
import { Typography } from '@/client/components/atoms/Typography';
import { ButtonBase } from '@/client/components/atoms/Button/Base';

// Not this, the barrel pulls the whole component tree
import { Typography, ButtonBase } from '@/client/components';
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

Services are singletons in `src/server/services/`, instantiated at module level. They use `@LogServiceMethod` decorator for automatic structured logging of method entry/exit (sensitive args excluded) — its `names` array labels the positional args that are safe to log. Services access user context via `RequestContext` (no parameter passing) and delegate to DB models — never accessing Prisma directly.

The `static readonly LOG_CONTEXT` field is **mandatory** (`cookhound/require-log-context`): the decorator otherwise falls back to the class name, which minification mangles.

```typescript
const LOG_CONTEXT = 'name-service';
const log = Logger.getInstance(LOG_CONTEXT);

class ServiceName {
    static readonly LOG_CONTEXT = LOG_CONTEXT;

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

- CSS-first configuration (Tailwind v4 — all theme config in CSS via `@theme`)
- Entry point is `src/client/globals.css`, which imports `src/client/styles/`:
    - `styles/theme/` — `colors.css` (raw oklch scales), `animations.css`, `semantic.css` (`@theme inline` aliases mapping `primary`→blue, `secondary`/`success`→green, `danger`→red, `warning`→yellow, `info`→blue, `sheet`→gray)
    - `styles/base.css` — resets and the dark-mode variant
    - `styles/utilities/` — `buttons.css`, `forms.css`, `layout.css`, `logo.css`, `typography.css`
- Custom animations: slide transitions, fade effects, rating pulse
- Responsive breakpoints including 3xl (2000px), declared as `--breakpoint-*` in `globals.css`
- Dark mode via `@custom-variant dark (&:where(.dark, .dark *))` (in `base.css`) and `prefers-color-scheme` media query

> `tailwind.config.cjs` still exists at the repo root but is **deprecated and inert** — its `@config` import in `globals.css` is commented out, and ESLint ignores the file. It is kept only as a migration reference. Never edit it to change styling; edit the CSS theme files.

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

## Testing

- **Vitest** (`yarn test`) for unit tests. Config in `vitest.config.mjs`: `vite-tsconfig-paths` for the `@/` alias, `server-only` aliased to an empty module, `NEXT_PUBLIC_ENV=test`, `e2e/` excluded.
- Tests are **colocated** next to the code they cover (`model-cache.test.ts`, `verify-recipe-path.test.ts`), except client data-layer hook tests, which live in `src/client/data/<domain>/__tests__/`.
- The default environment is **node**. A test that renders or uses `renderHook` must opt in per file with `// @vitest-environment jsdom` on line 1.
- Hook tests go through the port seam: build a fake repository (`src/client/data/__testing__/`) and pass it to `DataProvider` — never `fetch` or the production `repositories` object. Set `retry: false` on the test `QueryClient`.
- **Playwright** (`yarn test:e2e`) for e2e specs in `e2e/*.e2e.spec.ts`; helpers in `e2e/utils/`. These are excluded from Vitest and from ESLint.
- Run `yarn typecheck` alongside tests — the strictest guarantees in this codebase (DTO vs domain types, `I18nMessage` keys) are compile-time, not runtime.

## Logging & Monitoring

- Use structured logging with Winston (abstracted in `src/server/logger/`)
- Log all API requests and responses
- Include proper context in log messages
- Use appropriate log levels (trace, info, warn, error)
- Never log sensitive information (passwords, tokens)

## State Management

- **React Context** for global UI state, all under `src/client/store/`: `AuthContext`, `ThemeContext`, `SnackbarContext`, `ModalContext`, `ConsentContext`, `QueryContext` (react-query provider), `RecipeHandlingContext`, `MotionProvider` (lazy framer-motion features)
- **Zustand** for complex feature state — `useCreateRecipeStore`, `useRecipeSelectionStore` (`src/client/store/app-store/`). See @src/client/store/app-store/SELECTORS.md for selector-scoping conventions; never destructure the whole store hook.
- **@tanstack/react-query** for server state via typed wrappers `useAppQuery()` / `useAppMutation()` — domain query clients aggregated under `chqc` namespace
- Keep server state separate from client state
- There is **no** i18n context — translations are a static import, see Internationalization below

### API Client Architecture

Singleton `apiClient` (`src/client/request/apiClient/`) wraps `fetch` with domain-specific clients (auth, recipe, user, etc.) over the shared `ApiRequestWrapper`. All requests use `credentials: 'include'`. It returns **DTOs only** and knows nothing about react-query — the react-query layer lives in the data layer below (`src/client/data/<domain>/query/`), not under `request/`.

### Data Access Layer (Ports + Adapters)

All client data access is organized **by-domain** under `src/client/data/<domain>/` (`admin`, `auth`, `contact`, `cookbook`, `file`, `ingredient`, `recipe`, `report`, `tag`, `user`). Every domain follows the same four-role layout: **port** (`port.ts`), **adapter** (`adapters/httpAdapter.ts`), **query client** (`query/client.ts`), and **query keys** (`query/keys.ts`), plus an optional `revive.ts` for domains with `Date` fields. Hooks depend on the port (e.g. `RecipeRepository`) injected via `DataProvider` / `useRepositories()`; the cross-domain aggregator lives at `src/client/data/` and exposes every domain under the `chqc.<domain>.*` namespace. HTTP adapters handle DTO→domain mapping (date revival) and delegate to `apiClient` underneath; tests substitute fake repositories through the same provider. New endpoints follow a fixed five-file checklist (apiClient method → port method → adapter implementation → query key + options type → hook on `<domain>QueryClient`). See @src/client/data/README.md for the full contract, end-to-end flow, testing pattern, and the procedure for adding a new domain.

### Server Data Layer (`serverData`) — no SSR self-fetch

Server Components and server actions must **not** fetch their own API routes. `serverData` (`src/server/data/`) is the server-side counterpart to `chqc.<domain>`: instead of going out over HTTP and back through the request pipeline, it calls the service layer directly, in-process.

```ts
export const fooServerData = {
    getById: cache((id: number) =>
        ensureRenderContext(() => fooService.getById(id))
    )
};
```

- `ensureRenderContext` (`src/server/data/runtime/`) propagates `RequestContext` into an RSC render, which does not run `withRequestContext`
- Wrap **iff** the service actually reads `RequestContext`. Context-free reads (the whole recipe domain) call the service directly on purpose — building a context touches `cookies()`/`headers()` and would opt static/ISR routes into dynamic rendering
- `react`'s `cache()` dedupes within a render pass

See @src/server/data/README.md for the render-safety rules and the reasoning behind the context/context-free split.

### Event Bus

Custom strongly-typed `EventBus<EventMap>` (`src/client/events/`) — supports `on`, `once`, `off`, `emit` (async-aware). Events: `USER_LOGGED_IN`, `USER_LOGGED_OUT`, `CONSENT_CHANGED`, `NOT_FOUND_OPENED/CLOSED`. React integration via `useAppEventListener(event, callback)` hook.

## Internationalization (Czech-only)

The app ships **Czech only**. There is no locale detection, no provider, and no context — the previous `LocaleProvider` / `en.json` setup was removed (see `docs/CZECH-ONLY-MIGRATION.md`).

Translations are a plain static import from `src/client/locales/`:

```typescript
import { t } from '@/client/locales';

t('recipe.detail.title'); // ~115 files use this
t('recipe.servings', { count: 4 }); // {{count}} double-brace interpolation
```

- `cs.json` holds dot-notation keys; `I18nMessage` is the union of its keys, so an unknown key is a **type error**
- `t(key, params?, fallback?)` — the fallback is itself looked up as a key before being used as a literal
- Works in Server and Client Components alike (no hook, no subscription)
- Do not reintroduce `useTranslation()`/`LocaleProvider`-style wiring; if multi-locale returns, that is a deliberate migration, not an incidental one

## Next.js 16 Patterns

### 1. Build Configuration

- Turbopack for development builds (with @svgr/webpack via turbopack rules)
- Webpack for production builds (`next build --webpack`) with custom SVG handling
- Standalone output for Docker optimization

### 2. App Router Features

- Server components with async/await patterns
- `use()` hook for promise resolution in client components
- Proper loading.tsx and error boundaries

### 3. Middleware (`src/proxy.ts` + `src/server/proxy/`)

`src/proxy.ts` is the entry point; the steps live in `src/server/proxy/steps/` (`verify-recipe-path`, `verify-route-access`), with route policies in `routes.ts` and redirects in `redirects.ts`. The matcher excludes `api`, `_next/static`, `_next/image`, and `favicon.png`, so middleware never runs on API routes.

Step contract — each step returns a `NextResponse`, returns `null`, or throws:

1. Throwing `MiddlewareError` with an attached `response` stops the chain immediately and uses that response
2. Returning a `NextResponse` overwrites the running response, but later steps can overwrite it again
3. Returning `null` continues without modifying the response

Anything else thrown becomes a generic 500. Steps must be imported from their own module path, not the barrel.

## Technologies used

Versions below are the pinned/current ones — check `package.json` before assuming an API exists.

- **React 19.2** / **Next.js 16.2** (App Router)
- **TypeScript 5.9.3** with decorators support
- **Tailwind CSS 4** with CSS-first configuration
- **Vitest 2** for unit testing, **Playwright** for e2e
- **Prisma 7.8** with TypedSQL, via `@prisma/adapter-pg` over **PostgreSQL**
- **BullMQ 5** for job queues, on **ioredis** / Redis (also the cache + rate-limit store)
- **Typesense 2** for recipe search
- **Zod 4** for validation
- **Zustand 5** for client state management
- **@tanstack/react-query 5** for server state management
- **framer-motion 12** for animations
- **Winston** (+ daily-rotate-file) for structured logging
- **argon2** for password hashing
- **OpenAI SDK** for recipe evaluation (`src/server/integrations/openai`, `RECIPE_EVALUATION` queue)
- Other integrations in `src/server/integrations/`: `google` (OAuth), `mail`, `ntfy` (push notifications)

Remember: Prioritize type safety, error handling, and user experience in all implementations. Follow the established patterns and maintain consistency with the existing codebase architecture.
