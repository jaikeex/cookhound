# Client Data Layer - Ports, Adapters, and Hooks
> Drafted by claude, edited by me

> [!NOTE] Note on complexity
> This approach is wildly overengineered for an app of this size. 
> Originally the query client simply called the api client directly (which is actually not a bad thing on its own) but it made the layers too tightly coupled together, and after expreciencing the mess of mixing providers without a proper infrastructure on another project, i decided to future proof this by decoupling the clients altogether. Also, it looked like an interesting refactor. <br> None of this is really needed, and it arguably makes to code much more complex than it needs to be for a simple cookbook app... And it took more than two weeks to do this...



This folder is the client-side data access layer. Every domain follows the same layout.

The raw HTTP transport (`apiClient`) lives under
`src/client/request/apiClient/`. It returns DTOs and is unaware of this
folder. Each domain's adapter is the single point where DTO→domain
mapping happens for client code.

---

## 1. Directory layout

```
src/client/data/
├── DataProvider.tsx           # context, Repositories type, useRepositories()
├── repositories.ts            # default repositories object (one adapter per domain)
├── queryClient.ts             # chqc + QUERY_KEYS aggregators
├── queryFactories.ts          # useAppQuery / useAppMutation typed wrappers
└── <domain>/                  # same shape for every domain
    ├── port.ts                # the domain interface (e.g. RecipeRepository)
    ├── revive.ts              # DTO→domain mapper (not every domain needs this)
    ├── adapters/
    │   ├── <adapter.ts>       # various implementations
    │   └── index.ts           # re-exports the chosen default adapter
    └── query/
        ├── client.ts          # <domain>QueryClient — react-query hooks
        └── keys.ts            # <DOMAIN>_QUERY_KEYS + per-hook *Options types
```

### Four roles per domain

- **Port** (`port.ts`) — an interface in domain terms. The query client
  knows only this.
- **Adapter** (`adapters/httpAdapter.ts`) — implements the port. Holds
  DTO→domain mapping and any HTTP-specific code. `adapters/index.ts`
  picks the default, so a domain can grow more adapters (fakes,
  in-memory variants) without touching the wiring above.
- **Query client** (`query/client.ts`) — an object whose properties are
  the react-query hooks. Each hook calls `useRepositories()` to obtain
  the port and never imports `apiClient`. Re-exposed as
  `chqc.<domain>.*`.
- **Query keys** (`query/keys.ts`) — the `<DOMAIN>_QUERY_KEYS` factory
  plus the `*Options` types.

`revive.ts` is optional — only when output types carry `Date` fields.
The adapter calls it, and so do the `serverData` wrappers on the server
(`src/server/data/<domain>/server.ts` imports these helpers); consumers
never see it.

The barrel exports the keys, the default adapter, the query client, and
the port type. The raw `<domain>ApiClient` is an adapter implementation
detail — new code should not import it from hooks or components.

---

## 2. Shape of the layer

```
component
   │  uses chqc.<domain>.useFoo()
   ▼
hook (<domain>QueryClient property)
   │  const { <domain>Repository } = useRepositories();
   ▼
<Domain>Repository  ◄── port
   │
   ├── http<Domain>Repository  ◄── HTTP adapter
   │       │  delegates to <domain>ApiClient, applies revive
   │       ▼
   │   ApiRequestWrapper → fetch
   │
   └── any fake implementation  ◄── tests, Storybook
```

> **What "seam" means here.** From Michael Feathers' *Working Effectively
> with Legacy Code*: a seam is a place where you can alter behavior
> without editing in that place. Here it's the port interface + the
> `DataProvider` injection point. Hooks call
> `useRepositories().<domain>Repository.*` — they only know the port. In
> production we hand them the HTTP adapter; in tests, a `vi.fn()`-backed
> fake. The hook code does not change between the two.

---

## 3. Port contract

Four conventions apply to all ports:

**(a) Single-object payloads.** `useAppMutation` infers its variables
type from `Parameters<TFn>[0]`, so a single-object payload means
`useAppMutation(repo.method, opts)` works with no inline
`({ a, b }) => ...` wrapper. The underlying `apiClient` methods stay
positional; the adapter is where the shape changes.

```ts
update(args: { id: string; patch: Partial<RecipeForCreatePayload> }): Promise<Recipe>;
```

**(b) Reads accept `signal?: AbortSignal`.** Flows hook ⇒ port ⇒ adapter
⇒ `RequestConfig.signal` ⇒ `fetch`. React-query supplies it on the
`queryFn` arg and aborts in-flight requests on unmount/key-change.
Mutations do not take a signal.

```ts
getById(args: { id: string; signal?: AbortSignal }): Promise<Recipe>;
```

**(c) Domain types out, never DTOs.** Ports return domain types (with
real `Date` instances). DTOs (string timestamps) live only inside the
adapter and apiClient. Hooks and components never see a DTO. The two
types are deliberately distinct: any consumer that tries to use a
wire-fetched value as the domain type without revival fails in the type
checker.

**(d) Errors are `RequestError`** (`src/client/error/request.ts`),
carrying HTTP status, code, and request id. Consumers rely on this
without unwrapping transport-specific shapes.

---

## 4. DTO → domain mapping

The adapter is the single place where the revive helper is called for
client code. Every method that produces a domain type wraps its result:

```ts
getById: async ({ id, signal }) => {
    const dto = await recipeApiClient.getRecipeById(id, { signal });
    return reviveRecipeDates(dto);
}
```

Rules:

- apiClient methods return DTOs — annotate them as such.
- If the port returns a domain type, revive in the adapter. If it
  returns a DTO-shaped value (e.g. `*ForDisplayDTO[]`), no revival.
- Revive helpers throw when required timestamps are missing. Don't
  guard around them — let backend bugs surface as failures rather than
  as `new Date()` placeholders rendered to users.

---

## 5. `DataProvider`, `repositories`, `useRepositories`

Mounted at the app root in `src/app/providers.tsx`:

```tsx
import { DataProvider, repositories } from '@/client/data';

<DataProvider value={repositories}>{children}</DataProvider>
```

The `value` is the default `repositories` object — the centralized list
of adapters used in production, one slot per domain:

```ts
export const repositories = {
    adminRepository: adminRepositoryAdapter,
    // …one entry per domain
    userRepository: userRepositoryAdapter
};
```

Keeping the list out of `providers.tsx` means tests can build their own
`Repositories` and hand it to `DataProvider` without touching app
wiring. `useRepositories()` throws if no provider is mounted — a
misconfigured tree fails immediately with a clear message.

### Server Components — use `serverData`, not this layer

`DataProvider` is React context, so only Client Components can read it.
Server Components and server actions do **not** use this layer at all —
they use `serverData` (`src/server/data/`), which calls the service
layer directly in-process:

```ts
import { serverData } from '@/server/data';

const user = await serverData.user.getById(id);
```

This deliberately replaces the older "call `apiClient.<domain>.*` from
the page and revive it yourself" approach, which was an SSR self-fetch:
the page went out over HTTP to its own API route, paying a second
request pipeline, extra serialization, and (worst case) a deadlock
against Next's bounded worker pool. No page in `src/app/` imports
`apiClient` any more.

The revive helpers in this folder are still the single source of
DTO→domain mapping — the `serverData` wrappers import them
(`@/server/data/user/server.ts` → `@/client/data/user/revive`) so both
transports produce identical domain types. Revival lives in the
wrapper, not in the page.

See `src/server/data/README.md` for the `ensureRenderContext` rule
(wrap iff the service reads `RequestContext`, since building one opts
the route into dynamic rendering).

---

## 6. End-to-end flow

```ts
// component
const { data } = chqc.recipe.useRecipeById('42');

// recipe/query/client.ts
useRecipeById: (id, options?) => {
    const { recipeRepository } = useRepositories();
    return useAppQuery(
        RECIPE_QUERY_KEYS.byId(id),
        ({ signal }) => recipeRepository.getById({ id: String(id), signal }),
        { enabled: Boolean(id), retry: 1, ...options }
    );
},

// recipe/adapters/httpAdapter.ts
getById: async ({ id, signal }) => {
    const dto = await recipeApiClient.getRecipeById(id, { signal });
    return reviveRecipeDates(dto);
}
```

Each layer minds its own business: hooks know nothing about HTTP, the
adapter knows nothing about react-query, the transport knows nothing
about domain types.

---

## 7. Adding a new endpoint

Five files, in order. For a **query** (`getTopByTag`):

```ts
// 1. apiClient/<domain>/<Domain>ApiClient.ts — positional, DTO-shaped
async getTopByTag(tagId: number, config?: RequestConfig): Promise<RecipeForDisplayDTO[]> {
    return apiRequestWrapper.get({ url: `/recipes/tag/${tagId}/top`, ...config });
}

// 2. <domain>/port.ts — single-object payload, signal for reads
topByTag(args: { tagId: number; signal?: AbortSignal }): Promise<RecipeForDisplayDTO[]>;

// 3. <domain>/adapters/httpAdapter.ts — revive here iff the result is a domain type
topByTag: ({ tagId, signal }) => recipeApiClient.getTopByTag(tagId, { signal })

// 4. <domain>/query/keys.ts
topByTag: (tagId: number) => [RECIPE_NAMESPACE_QUERY_KEY, 'topByTag', tagId] as const,

export type TopByTagOptions = Omit<
    UseQueryOptions<
        RecipeForDisplayDTO[], RequestError, RecipeForDisplayDTO[],
        ReturnType<typeof RECIPE_QUERY_KEYS.topByTag>
    >, 'queryKey' | 'queryFn'
>;

// 5. <domain>/query/client.ts
useTopRecipesByTag: (tagId: number, options?: Partial<TopByTagOptions>) => {
    const { recipeRepository } = useRepositories();
    return useAppQuery(
        RECIPE_QUERY_KEYS.topByTag(tagId),
        ({ signal }) => recipeRepository.topByTag({ tagId, signal }),
        { enabled: Boolean(tagId), retry: 1, ...options }
    );
},
```

The hook is automatically reachable as
`chqc.<domain>.useTopRecipesByTag(...)`.

For a **mutation** the differences are: port omits `signal`, options
type uses `UseMutationOptions`, and the hook can pass the port method to
`useAppMutation` directly (callers do `mutate({ id: '42' })`):

```ts
archive(args: { id: string }): Promise<void>;

export type ArchiveRecipeOptions = Omit<
    UseMutationOptions<void, RequestError, { id: string }>,
    'mutationFn'
>;

useArchiveRecipe: (options?: Partial<ArchiveRecipeOptions>) => {
    const { recipeRepository } = useRepositories();
    return useAppMutation(recipeRepository.archive, options);
},
```

---

## 8. Testing a hook

The seam exists so hooks can be tested without `fetch`. Reference:
`recipe/__tests__/useRecipeById.test.tsx`.

```tsx
const repo: RecipeRepository = buildFakeRepository({
    getById: vi.fn().mockResolvedValue(fixtureRecipe)
});

const wrapper = ({ children }) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }}})}>
        <DataProvider value={{ recipeRepository: repo }}>{children}</DataProvider>
    </QueryClientProvider>
);

const { result } = renderHook(() => recipeQueryClient.useRecipeById('42'), { wrapper });
await waitFor(() => expect(result.current.isSuccess).toBe(true));
```

Operational notes:

- Add `// @vitest-environment jsdom` at the top — `renderHook` needs a
  DOM, Vitest defaults to Node.
- Set `retry: false`, or rejected fakes retry three times and a failing
  test takes 30 seconds.
- Build a complete fake with `vi.fn()` for every method; override only
  what the test needs. Avoids "method is undefined" when react-query
  schedules a background refetch.
- Pass the fake to `DataProvider` directly. Don't import the production
  `repositories` object — the point of the seam is that the test
  composes its own.

This covers hook-level behavior (the `enabled` gate, signal wiring). It
does not cover URL shape or JSON parsing — those are the adapter's
responsibility and would be tested with MSW.

---
> [!IMPORTANT]  
>**No server-side `useRepositories()` exists, and none is needed.**
  Server Components and server actions use `serverData`
  (`src/server/data/`), which reaches the service layer directly instead
  of self-fetching this app's own API routes. Ports, adapters, and
  `DataProvider` are the client-side path only. The two paths meet at the
  `revive.ts` helpers, which both call.

> [!NOTE]  
> **Transport-level navigation side effects.** `ApiRequestWrapper.ts`
  performs `window.location.href = '/error/too-many-requests'` on a 429
  (branch guarded by `typeof window !== 'undefined'`) and `notFound()` on
  a 404 (guarded by `typeof window === 'undefined'`) before throwing.
  Every consumer inherits these behaviors. The seam makes moving them to
  a hook, adapter, or route-level error boundary tractable
  (`RequestError.status` is there to dispatch on), but the move is not
  yet done. Note the 404 branch is now effectively unreachable — it only
  fires when `apiClient` runs outside a browser, and since the move to
  `serverData` nothing renders through it server-side. RSC 404s are
  raised by the page (or `serverData`), not by the transport.

