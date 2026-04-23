# Zustand Selector Scoping

> *Drafted by claude, edited by me*

Zustand stores expose a single hook (e.g. `useCreateRecipeStore`) that can be called in two fundamentally different ways. The difference looks cosmetic but has large performance consequences, especially for components that are rendered many times (list rows, form fields, table cells).

This document is intended as a practical reference for anyone adding a new consumer of a store under `src/client/store/app-store/`.

---

## 1. The two call styles

### (A) Whole-store subscription — do NOT default to this

```ts
const { recipeObject, updateRecipeObject } = useCreateRecipeStore();
```

Under the hood this is equivalent to:

```ts
const state = useCreateRecipeStore((s) => s);
```

The selector returns the entire state object. Zustand compares the previous selector output to the new one with `Object.is` after every `set(...)` call. Because `set` creates a new state object every time, `Object.is(prev, next)` is always `false` — so the component re-renders on **every** store update, even ones it does not care about.

### (B) Narrow per-slice selectors — the preferred pattern

```ts
const recipeObject = useCreateRecipeStore((s) => s.recipeObject);
const count = useCreateRecipeStore((s) => s.items?.length ?? 0);
const setX = useCreateRecipeStore((s) => s.setX);
```

Each call subscribes only to the value returned by its selector. Zustand still compares with `Object.is`, but now the comparison is against a specific slice. A re-render only happens when **that** slice's identity changes.

---

## 2. Why reference identity matters

The default equality check is `Object.is`, which is a reference/value comparison — not a deep compare. Two consequences follow:

- **Primitives** (number, string, boolean) are compared by value. Selecting `state.items.length` or `state.user.name` is essentially free: the component only re-renders when that exact number/string changes.

- **Objects and arrays** are compared by reference. If a store action does:

    ```ts
    set((s) => ({ recipeObject: { ...s.recipeObject, title: v } }));
    ```

    then `recipeObject` is a new reference on every call, even if only one field changed. Subscribers to `(s) => s.recipeObject` will re-render on every edit — which is correct, but it means you should prefer selecting the narrowest primitive you actually use.

This is why, in this codebase, list rows select only `state.recipeObject?.ingredients?.length ?? 0` instead of the whole `recipeObject`: rows don't care about title/instructions/image changes, and the length is a primitive that rarely changes.

---

## 3. Actions are free to select

Actions defined inside `create(...)` (e.g. `setRecipeObject`, `incrementSuggestions`) are created **once** when the store is initialized and their identity never changes for the lifetime of the store. Selecting them individually is therefore effectively a no-op for re-render purposes:

```ts
const setRecipeObject = useCreateRecipeStore((s) => s.setRecipeObject);
```

This hook call will never cause a re-render on its own, because the selector always returns the same function reference.

This is also why splitting a destructure into N per-slice selectors is not "N times more work" — the action selectors cost you nothing.

---

## 4. When you need multiple values at once

A natural instinct is:

```ts
const { a, b } = useCreateRecipeStore((s) => ({ a: s.a, b: s.b }));
```

This is **worse** than two separate calls. The selector returns a fresh object literal on every invocation, so `Object.is` always sees a new reference and the component re-renders on every store update — the exact problem you were trying to avoid.

Two correct alternatives:

### (a) Prefer multiple atomic calls

This is the default in this codebase and is almost always the right answer:

```ts
const a = useCreateRecipeStore((s) => s.a);
const b = useCreateRecipeStore((s) => s.b);
```

### (b) Use a shallow equality comparator

If you truly need an object and atomic calls feel awkward:

```ts
import { useShallow } from 'zustand/react/shallow';

const { a, b } = useCreateRecipeStore(useShallow((s) => ({ a: s.a, b: s.b })));
```

`useShallow` compares the returned object's own properties with `Object.is` one level deep, so a fresh `{ a, b }` literal with unchanged values does not trigger a re-render.

---

## 5. Reading without subscribing

Sometimes you only need a value at the moment an event handler fires — not to drive a render. In that case, do **not** subscribe at all; use the store's imperative API:

```ts
const onClick = () => {
    const { recipeObject } = useCreateRecipeStore.getState();
    submit(recipeObject);
};
```

`getState()` reads the current value without creating a subscription, so the component's render count is unaffected by changes to that value. This is especially useful inside stable callbacks, effects, or async code where the latest value is what matters and you want to avoid stale closures without paying a re-render cost.

---

## 6. A practical checklist

When adding a new consumer of a zustand store, ask:

1. **Is this component rendered many times** (list row, grid cell, etc.)?
    - Be aggressive about narrowing. Prefer primitives.

2. **Do I destructure out of `useStore()`?**
    - Split into per-slice selectors. Never destructure the whole hook.

3. **Am I selecting an object or array?**
    - Confirm I actually need to react to its reference changes. If I only use one field, select that field instead.

4. **Am I building `{ ... }` inside the selector?**
    - Either split into multiple selectors or wrap in `useShallow`.

5. **Do I only need the value inside a handler, not during render?**
    - Use `useStore.getState()` and skip subscribing entirely.

---

## 7. Why this matters for Cookhound specifically

The recipe creation flow renders `IngredientRow` / `InstructionRow` components N times, and `updateRecipeObject` fires on every keystroke, producing a new `recipeObject` reference each time. A single row that subscribes to the whole `recipeObject` therefore re-renders on every keystroke in every **other** row — an O(N) cost per character typed. Scoping each row to a single primitive (e.g. the ingredients count) eliminates this cascade entirely and keeps the editor responsive as recipes grow.

The same reasoning applies to any store in this folder: before wiring a new component into a store, look at what triggers updates, how often those updates fire, and how many instances of the component exist on screen at once. The narrower the selector, the fewer renders you pay for.
