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
│   │   ├── components/        # React components (atomic design pattern)
│   │   │   ├── atoms/         # Basic building blocks
│   │   │   ├── molecules/     # Simple component combinations
│   │   │   ├── organisms/     # Complex UI sections
│   │   │   └── templates/     # Page-level layouts
│   │   ├── constants/         # Constants
│   │   ├── errors/            # Errors
│   │   ├── events/            # Events bus
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # State management (contexts, stores)
│   │   ├── request/           # API client and react-query wrappers
│   │   ├── types/             # Client-specific types
│   │   ├── utils/             # Client utilities
│   │   └── locales/           # Internationalization
│   ├── server/                # Server-side code
│   │   ├── db/                # Database (Prisma schema, models)
│   │   ├── errors/            # Errors
│   │   ├── services/          # Business logic services
│   │   ├── search-index/      # Typesense search index
│   │   ├── utils/             # Server utilities
│   │   ├── logger/            # Logging infrastructure
│   │   │── integrations/      # External service integrations
│   │   │── queues/            # BullMQ queues and jobs
│   └── common/                # Shared code between client/server
│       ├── types/             # Shared TypeScript types
│       ├── constants/         # Shared constants
│       └── utils/             # Shared utilities
├── public/                    # Static assets
└── scripts/                   # Build and deployment scripts
```

## Build

- This project uses yarn for package management

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

### 4. API Design Patterns

- Use Next.js App Router API routes in `src/app/api/`
- Implement proper HTTP status codes (200, 400, 401, 404, 500)
- Add rate limiting to all API endpoints using `withRateLimit`
- Use `RequestContext.run()` for request handling
- Always validate authentication and authorization
- Log requests and responses using structured logging

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

```typescript
class ServiceName {
    async methodName(param: Type): Promise<ReturnType> {
        log.trace('methodName - attempt', { param });

        try {
            // Validation
            if (!param) {
                throw new ValidationError();
            }

            // Business logic
            const result = await db.model.operation(param);

            log.trace('methodName - success', { result });
            return result;
        } catch (error: unknown) {
            log.error('methodName - error', { error, param });
            throw error;
        }
    }
}
```

### Error Handling Patterns

```typescript
// Server-side error handling
try {
    const result = await service.method();
    return Response.json(result);
} catch (error: unknown) {
    return handleServerError(error);
}

## Styling & Design System

### 1. Tailwind CSS

-   Custom color palette with semantic color names (primary, secondary, success, danger, warning, info)
-   Custom animations: slide transitions, fade effects, rating pulse
-   Responsive breakpoints including 3xl (2000px)
-   Dark mode support with 'selector' strategy

### 2. Animation Patterns

-   Use Tailwind custom animations for UI transitions
-   Consistent slide/fade animations across components
-   Custom keyframes for complex interactions (rating-pulse, fade-in-up)


## Security & Authentication

-   Always check user authentication before protected operations
-   Use proper role-based access control
-   Validate all inputs on both client and server
-   Use HTTPS in production
-   Implement proper CORS policies
-   Use secure cookie settings for sessions
-   Rate limit appropriate API endpoints to prevent abuse

## Privacy & Consent Management

### 1. Cookie Consent System

-   GDPR-compliant consent management with versioning
-   Categories: essential, preferences, analytics, marketing
-   Browser-side storage + server-side audit trail
-   Context provider pattern for consent state
-   IP address and user agent tracking for compliance and proof of consent
-   Consent proof hashing for legal compliance

## Performance & Optimization

-   Implement proper loading states and skeletons
-   Use Next.js Image component for optimized images
-   Implement pagination for large data sets
-   Use proper caching strategies (Redis for server)
-   Bundle splitting and code splitting where appropriate

## Logging & Monitoring

-   Use structured logging with Winston (abstracted in `src/server/utils/logger`)
-   Log all API requests and responses
-   Include proper context in log messages
-   Use appropriate log levels (trace, info, warn, error)
-   Never log sensitive information (passwords, tokens)

## State Management

-   Use React Context for app-wide state
-   Use Zustand for complex client state
-   Keep server state separate from client state
-   Use proper state normalization patterns
-   Implement optimistic updates where appropriate

## Internationalization

-   Support multiple locales (en, cs)
-   Use proper key-based translation system
-   Implement locale detection and switching
-   Store user locale preferences
-   Support RTL languages if needed

## Next.js 15.x Patterns

### 1. Build Configuration

-   Turbopack for fast development builds
-   Standalone output for Docker optimization
-   SVG components via @svgr/webpack integration
-   Custom webpack configuration for asset handling

### 2. App Router Features

-   Server components with async/await patterns
-   `use()` hook for promise resolution in client components
-   Proper loading.tsx and error boundaries
-   Middleware with custom error handling patterns

## Technologies used

-   **React 19.1.1**
-   **Next.js 15.5.3**
-   **TypeScript 5.9.2** with decorators support
-   **Tailwind CSS 3.4.17** with custom design system
-   **Vitest 2.1.1** for testing
-   **Prisma 6.16.1** with TypedSQL
-   **BullMQ 5.58.5** for job queues

Remember: Prioritize type safety, error handling, and user experience in all implementations. Follow the established patterns and maintain consistency with the existing codebase architecture.
```
