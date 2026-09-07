---
title: "useRef"
date: 2025-01-15
tags:
  - react
  - frontend
description: "useRef hook in React"
---

`useRef` gives you a mutable container — `{ current: value }` — that persists for the full lifetime of the component without triggering re-renders when changed. This makes it the right tool for two distinct jobs: holding a reference to a DOM node for imperative operations, and storing any mutable value that your component needs to remember across renders but that should _not_ drive the UI.

The key mental model: `useState` is for values that should be _shown_; `useRef` is for values that should be _remembered_.

## Typical patterns

- Imperative DOM focus/scroll:

```tsx
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

- Persist values across renders without re-rendering (timeouts, previous values, counters not shown in UI).
- Store mutable instances (e.g., external libraries) between renders.

## Anti-patterns

- Don’t replace state with refs for UI state — refs won’t trigger re-renders.
- Avoid reading/writing refs during render; prefer effects.

## When to choose useRef vs state

- If UI must update -> state.
- If value is only for effects/imperative logic -> ref.

## Related Notes

- [[react-forwardRef|Forwarding Ref]]
- [[react-optimizing-with-memoization|Optimizing React with Memoization]]
- [[react-suspense|React.Suspense]]
