# Recipe Domain — Ports, Adapters, and Hooks

> The conventions here apply to all domains, current and future. The
> `recipe` domain is the worked example; once a second domain migrates,
> the same shape applies inside its own folder.

This folder is the by-domain home for everything client code needs to talk
to recipes: the **port** the query layer depends on, the HTTP **adapter**
that implements it, the **query keys** that index react-query's cache, and
the **query client** (`recipeQueryClient`) — an object whose properties are
the react-query hooks consumers call. That same object is re-exposed under
the legacy `chqc.recipe.*` namespace from
`src/client/request/queryClient/index.ts`.

The cross-domain glue lives in `src/client/data/`:

- `DataProvider.tsx` — the React context, the `Repositories` type, and
  `useRepositories()`.
- `repositories.ts` — the default `repositories` object that aggregates one
  adapter per domain. The app root passes this object as the provider's
  `value`. Tests pass their own object instead.

The raw HTTP transport (`recipeApiClient`) lives in
`src/client/request/apiClient/recipe/`. It returns DTOs and is unaware of
this folder. The adapter is the single point where DTO→domain mapping
happens for client code.

This document is a reference for anyone — human or agent — adding new
recipe endpoints or migrating another domain to the same pattern.

---

## 1. Directory layout

```
src/client/data/
├── DataProvider.tsx           # React context, Repositories type, useRepositories()
├── repositories.ts            # default `repositories` object (one adapter per domain)
├── index.ts                   # barrel: re-exports the provider, the type, and `repositories`
└── recipe/
    ├── port.ts                # the domain interface (RecipeRepository)
    ├── adapters/
    │   ├── adapter.ts         # HTTP-backed implementation (httpRecipeRepository)
    │   └── index.ts           # re-exports the chosen default adapter
    ├── query/
    │   ├── client.ts          # `recipeQueryClient` — react-query hooks as object properties
    │   └── keys.ts            # RECIPE_QUERY_KEYS + per-hook *Options types
    ├── index.ts               # barrel
    ├── README.md              # you are here
    └── __tests__/
        └── useRecipeById.test.tsx
```

Four roles per domain:

- **Port** (`port.ts`) — an interface in domain terms. The query client
  knows only this.
- **Adapter** (`adapters/adapter.ts`) — implements the port. Holds
  DTO→domain mapping and any HTTP-specific glue. `adapters/index.ts`
  picks which concrete adapter is the default and re-exports it (so a
  domain can grow more adapters — fakes, in-memory variants — without
  touching the wiring above).
- **Query client** (`query/client.ts`) — the `recipeQueryClient` object
  whose properties are the react-query hooks. Each hook calls
  `useRepositories()` to obtain the port and never imports `apiClient`.
  This is the single object exposed as `chqc.recipe.*`.
- **Query keys** (`query/keys.ts`) — `RECIPE_QUERY_KEYS` and the `*Options`
  types that keep react-query generics tidy.

The recipe barrel (`recipe/index.ts`) re-exports:

- everything from `query/keys.ts` (so `RECIPE_QUERY_KEYS` and the option
  types are reachable),
- `recipeRepositoryAdapter` (default export of `adapters/index.ts`) — the
  adapter that gets registered in `repositories.ts`,
- `recipeQueryClient` (from `query/client.ts`),
- the `RecipeRepository` type.

`recipeApiClient` is an adapter implementation detail. New code should
not import it directly from hooks or components.

---

## 2. The shape of the layer

```
component
   │
   │ uses chqc.recipe.useFoo() / recipeQueryClient.useFoo()
   ▼
hook (property on recipeQueryClient in recipe/query/client.ts)
   │
   │ const { recipeRepository } = useRepositories();
   ▼
RecipeRepository  ◄── port (recipe/port.ts)
   │
   ├── httpRecipeRepository  ◄── HTTP adapter (recipe/adapters/adapter.ts)
   │       │
   │       │ delegates to recipeApiClient
   │       │ applies reviveRecipeDates uniformly
   │       ▼
   │   ApiRequestWrapper → fetch
   │
   └── any fake implementation  ◄── tests, Storybook, etc.
```

---

## 3. The contract the port enforces

`RecipeRepository` is the canonical reference for what every recipe-data
implementation must satisfy. Four conventions apply across all methods:

### (a) Single-object payloads

```ts
// Port
update(args: { id: string; patch: Partial<RecipeForCreatePayload> }): Promise<Recipe>;

// Adapter
update: ({ id, patch }) => recipeApiClient.updateRecipe(id, patch).then(reviveRecipeDates)
```

`useAppMutation` infers its variables type from `Parameters<TFn>[0]`. A
single-object payload means `useAppMutation(repo.update, opts)` works with
no inline `({ a, b }) => ...` wrapper. The legacy `recipeApiClient` methods
are still positional; the adapter is where the shape changes.

### (b) Reads accept `signal?: AbortSignal`

```ts
getById(args: { id: string; signal?: AbortSignal }): Promise<Recipe>;
```

The signal flows: hook ⇒ port ⇒ adapter ⇒ `RequestConfig.signal` ⇒ `fetch`.
React-query supplies the signal on the `queryFn` arg and aborts in-flight
requests when the query unmounts or its key changes. Mutations do not take
a signal.

### (c) Domain types out, never DTOs

```ts
getById(...): Promise<Recipe>;  // not RecipeDTO
```

The port returns domain types (`Recipe`, with real `Date` instances). DTOs
(`RecipeDTO`, with `string` timestamps) live only inside the adapter and
the `apiClient` underneath it. Hooks and components never see a DTO.

The `Recipe` and `RecipeDTO` types are deliberately distinct: any consumer
that tries to use a wire-fetched recipe as `Recipe` without revival fails
in the type checker.

### (d) Errors are `RequestError`

Every method's documented failure mode is a thrown
`RequestError` (`src/client/error/request.ts`), carrying HTTP status, code,
and request id. Adapters and consumers can rely on this without unwrapping
transport-specific shapes.

---

## 4. DTO → domain mapping in the adapter

The adapter is the single place where `reviveRecipeDates` is called. Every
method that should produce a `Recipe` (as opposed to a
`RecipeForDisplayDTO` list) wraps its result with revival:

```ts
getById: async ({ id, signal }) => {
    const dto = await recipeApiClient.getRecipeById(id, { signal });
    return reviveRecipeDates(dto);
}
```

Rules of the road for adapter authors:

- `recipeApiClient` methods return DTOs. Annotate them as such.
- If the port method returns `Recipe` (or `Recipe[]`), revive in the
  adapter. If it returns `RecipeForDisplayDTO[]`, no revival is needed.
- `reviveRecipeDates` throws when a required timestamp is missing. Do not
  guard around it — let it propagate so backend bugs surface as failures
  rather than as `new Date()` placeholders rendered to users.

---

## 5. `DataProvider`, `repositories`, and `useRepositories`

Mounted at the app root in `src/app/providers.tsx`:

```tsx
import { DataProvider, repositories } from '@/client/data';

<DataProvider value={repositories}>
    <ModalProvider>{children}</ModalProvider>
</DataProvider>
```

The `value` is the default `repositories` object from
`src/client/data/repositories.ts`. That file is the centralized list of
adapters used in production:

```ts
// src/client/data/repositories.ts
import { recipeRepositoryAdapter } from './recipe';

export const repositories = {
    recipeRepository: recipeRepositoryAdapter
};
```

Each domain exports exactly one default adapter through its barrel; the
`repositories` object aggregates them. Keeping the adapter list out of
`providers.tsx` means tests can build their own `Repositories` and hand it
to `DataProvider` without touching app wiring.

Consumed by hooks via `useRepositories()`:

```ts
export const useRepositories = (): Repositories => {
    const ctx = useContext(DataContext);

    if (!ctx) {
        throw new Error('useRepositories must be used inside a DataProvider');
    }

    return ctx;
};
```

Notes:

- `useRepositories()` throws if no provider is mounted. A misconfigured
  tree fails immediately with a clear message rather than limping along
  until something downstream blows up.
- The `Repositories` type currently has a single slot, `recipeRepository`.
  Adding a domain means adding a slot to the type **and** adding an entry
  to `repositories.ts`.

### Server Components

`DataProvider` is React context — only Client Components can read it.
Server Components that need a recipe call `apiClient.recipe.*` directly
and apply `reviveRecipeDates` themselves. The wire types (`RecipeDTO` with
string timestamps) make this contract compile-time-enforced: a server page
that forgets to revive cannot type-check its result as a `Recipe`.

---

## 6. End-to-end flow of a request

A component calls a hook from `chqc.recipe.*` (or directly from
`recipeQueryClient`). The chain looks like this:

```ts
// component
const { data } = chqc.recipe.useRecipeById('42');
```

```ts
// recipe/query/client.ts — property on recipeQueryClient
useRecipeById: (id, options?) => {
    const { recipeRepository } = useRepositories();   // ← injected port
    return useAppQuery(
        RECIPE_QUERY_KEYS.byId(id),
        ({ signal }) => recipeRepository.getById({ id: String(id), signal }),
        { enabled: Boolean(id), retry: 1, ...options }
    );
},
```

```ts
// recipe/adapters/adapter.ts
getById: async ({ id, signal }) => {
    const dto = await recipeApiClient.getRecipeById(id, { signal });
    return reviveRecipeDates(dto);
}
```

```ts
// apiClient/recipe/RecipeApiClient.ts
async getRecipeById(id, config?) {
    return apiRequestWrapper.get<RecipeDTO>({ url: `/recipes/${id}`, ...config });
}
```

```ts
// apiClient/ApiRequestWrapper.ts
if (config.signal) options.signal = config.signal;   // ← passed to fetch
return await fetch(url.toString(), options);
```

Each layer minds its own business: hooks know nothing about HTTP, the
adapter knows nothing about react-query, the transport knows nothing about
`Recipe`. The seam between hooks and the port is the single point at
which behavior can be substituted.

> **Aside — what "seam" means here.** The term comes from Michael Feathers'
> *Working Effectively with Legacy Code*: a seam is a place where you can
> alter behavior in your program without editing in that place. In this
> folder, the seam is the `RecipeRepository` interface combined with the
> `DataProvider` injection point. Hooks call `useRepositories().recipeRepository.*` —
> they only know the port. In production we hand them `httpRecipeRepository`;
> in tests we hand them a `vi.fn()`-backed fake. The hook code does not
> change between the two. Whenever this README says "the seam," it means
> that port-plus-DI boundary, not the adapter or the transport.

---

## 7. Adding a new recipe endpoint (query)

Five files to edit, in this order. Treat the example (`getTopByTag` —
most-favorited recipes for a tag) as a template.

### Step 1 — Add the API method to the apiClient

```ts
// src/client/request/apiClient/recipe/RecipeApiClient.ts
async getTopByTag(tagId: number, config?: RequestConfig): Promise<RecipeForDisplayDTO[]> {
    return apiRequestWrapper.get({ url: `/recipes/tag/${tagId}/top`, ...config });
}
```

`apiClient` methods stay positional and DTO-shaped.

### Step 2 — Add the method to the port

```ts
// src/client/data/recipe/port.ts
topByTag(args: {
    tagId: number;
    signal?: AbortSignal;
}): Promise<RecipeForDisplayDTO[]>;
```

Single-object payload; include `signal` because it's a read.

### Step 3 — Implement it in the adapter

```ts
// src/client/data/recipe/adapters/adapter.ts
topByTag: ({ tagId, signal }) =>
    recipeApiClient.getTopByTag(tagId, { signal })
```

If the new endpoint returns `Recipe` (not `RecipeForDisplayDTO`), wrap
with `reviveRecipeDates` here — never anywhere else.

### Step 4 — Add a query key and an options type

```ts
// src/client/data/recipe/query/keys.ts
export const RECIPE_QUERY_KEYS = Object.freeze({
    ...,
    topByTag: (tagId: number) =>
        [RECIPE_NAMESPACE_QUERY_KEY, 'topByTag', tagId] as const,
});

export type TopByTagOptions = Omit<
    UseQueryOptions<
        RecipeForDisplayDTO[], RequestError,
        RecipeForDisplayDTO[],
        ReturnType<typeof RECIPE_QUERY_KEYS.topByTag>
    >, 'queryKey' | 'queryFn'
>;
```

### Step 5 — Add the hook to `recipeQueryClient`

```ts
// src/client/data/recipe/query/client.ts
export const recipeQueryClient = {
    ...,
    useTopRecipesByTag: (
        tagId: number,
        options?: Partial<TopByTagOptions>
    ) => {
        const { recipeRepository } = useRepositories();
        return useAppQuery(
            RECIPE_QUERY_KEYS.topByTag(tagId),
            ({ signal }) => recipeRepository.topByTag({ tagId, signal }),
            {
                enabled: Boolean(tagId),
                retry: 1,
                ...options
            }
        );
    },
};
```

Because `recipeQueryClient` is re-exported as `chqc.recipe` from
`src/client/request/queryClient/index.ts`, the new hook is automatically
reachable as `chqc.recipe.useTopRecipesByTag(...)` with no further wiring.

The chain you've built is: **apiClient method ⇒ port method ⇒ adapter
implementation ⇒ query key + options type ⇒ hook on `recipeQueryClient`.**

---

## 8. Adding a new endpoint (mutation)

Same five steps. The differences are in steps 2, 4, and 5:

```ts
// Port — no signal on mutations
archive(args: { id: string }): Promise<void>;
```

```ts
// query/keys.ts
export type ArchiveRecipeOptions = Omit<
    UseMutationOptions<void, RequestError, { id: string }>,
    'mutationFn'
>;
```

```ts
// query/client.ts — property on recipeQueryClient
useArchiveRecipe: (options?: Partial<ArchiveRecipeOptions>) => {
    const { recipeRepository } = useRepositories();
    return useAppMutation(recipeRepository.archive, options);
},
```

Because the port method takes `{ id }` (single-object payload),
`useAppMutation(recipeRepository.archive, options)` accepts the port method
directly. Callers do `mutate({ id: '42' })`.

---

## 9. Testing a hook

The seam exists so hooks can be tested without `fetch`. The reference test
lives at `src/client/data/recipe/__tests__/useRecipeById.test.tsx` — copy
from there.

Shape:

```tsx
import { recipeQueryClient } from '@/client/data/recipe';
import { DataProvider, type Repositories } from '@/client/data';

const repo: RecipeRepository = buildFakeRepository({
    getById: vi.fn().mockResolvedValue(fixtureRecipe)
});

const wrapper = ({ children }) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }}})}>
        <DataProvider value={{ recipeRepository: repo }}>{children}</DataProvider>
    </QueryClientProvider>
);

const { result } = renderHook(
    () => recipeQueryClient.useRecipeById('42'),
    { wrapper }
);
await waitFor(() => expect(result.current.isSuccess).toBe(true));
```

Operational notes:

- Add `// @vitest-environment jsdom` at the top of the file. Vitest
  defaults to a Node environment; `renderHook` needs a DOM. Don't change
  the global config — the per-file directive is enough.
- Set `retry: false` on the `QueryClient` in the wrapper. Otherwise
  rejected fakes retry three times and a failing test takes 30 seconds.
- Build a complete fake repository with `vi.fn()` for every method, then
  override only what the test needs. This avoids "method is undefined"
  errors when react-query schedules a background refetch.
- Pass the fake to `DataProvider` directly (`value={{ recipeRepository: repo }}`).
  Do not import the production `repositories` object from
  `@/client/data` in tests — the whole point of the seam is that the
  test composes its own.

What this kind of test covers: hook-level behavior (the `enabled` gate,
signal wiring through to the port). It does not cover URL shape or JSON
parsing — those are the adapter's responsibility and would be tested with
MSW once a second domain migrates.

---

## 10. Adding a new domain

The `recipe` domain is the worked example; other domains (`cookbook`,
`tag`, `user`, etc.) still use the legacy `chqc.foo.*` pattern with direct
`apiClient` imports. To migrate one to the by-domain pattern:

1. Create `src/client/data/<domain>/` mirroring the recipe layout:
   `port.ts`, `adapters/adapter.ts`, `adapters/index.ts`,
   `query/client.ts`, `query/keys.ts`, plus a barrel `index.ts`. Keep the
   file names identical across domains so the pattern is greppable.
2. Add a slot to the `Repositories` type in
   `src/client/data/DataProvider.tsx`:
   `<domain>Repository: <Domain>Repository;`.
3. Register the default adapter in `src/client/data/repositories.ts`:
   `<domain>Repository: <domain>RepositoryAdapter`. (No edit to
   `providers.tsx` is needed — it already passes the aggregated
   `repositories` object.)
4. Update `src/client/request/queryClient/index.ts` to import
   `<domain>QueryClient` and `<DOMAIN>_QUERY_KEYS` from
   `@/client/data/<domain>` instead of `./<domain>`. Delete the now-empty
   `request/queryClient/<domain>/` folder.
5. Move the existing class-with-arrow-property-hooks query client into
   `<domain>/query/client.ts`. The object-of-hooks shape is preserved —
   what changes is the file's location and that each hook now obtains its
   port via `useRepositories()` instead of importing `apiClient`. Drop
   any `react-hooks/rules-of-hooks` eslint-disable that was needed for
   the legacy nested-class form.

The two patterns coexist; there is no flag day. Existing `chqc.<domain>.*`
call sites keep working because `chqc.<domain>` is just `<domain>QueryClient`
re-exported from a different folder.

---

## 11. Scope of this layer

What this layer is:

- A dependency-inversion seam at the hook/transport boundary.
- A single place where DTO→domain mapping happens for recipe reads.
- A substitution point for tests and (future) Storybook.

What this layer is not:

- It is not hexagonal architecture, a use-case layer, or an attempt to
  make the codebase swappable between REST and GraphQL.
- It does not replace `apiClient`. It sits on top of it.
- It does not provide server-side dependency injection. Server Components
  still call `apiClient` directly.

---

## 12. Known limitations

- **Transport-level navigation side effects.** `ApiRequestWrapper.ts`
  performs `window.location.href = '/error/too-many-requests'` on a 429
  (client-side) and `notFound()` on a 404 (server-side) before throwing
  the resulting `RequestError`. Every consumer — adapter or otherwise —
  inherits these behaviors. The seam makes moving them to a hook,
  adapter, or route-level error boundary tractable (the
  `RequestError.status` is already there to dispatch on), but the move is
  not yet done.
- **No server-side `useRepositories()` equivalent.** Server Components
  must call `apiClient.recipe.*` directly and revive dates by hand. The
  wire types make forgetting to revive a compile error, but the
  ergonomics are unfinished.
- **Only `recipe` is wired.** All other domains still resolve through the
  legacy `chqc.*` query clients with direct `apiClient` imports.
