---
title: "React.Suspense"
date: 2025-01-15
tags:
  - react
  - frontend
description: "React.Suspense for lazy loading"
---

`React.Suspense` is a boundary component that lets you declaratively specify a fallback UI while its children are "suspended" — waiting for code to load or, in frameworks like Next.js/Remix, for async data to resolve. It decouples the loading concern from the component that needs the data, keeping each piece focused on its own responsibility.

## Why use Suspense

Suspense lets you declaratively handle loading states for code-splitting and async data (with frameworks that support it). It improves first-load performance and keeps your UI logic focused on states that matter.

## Core patterns

- Lazy load routes and components with `React.lazy(() => import('./Component'))`.
- Wrap sections with `Suspense fallback={<Spinner />}` to show a non-blocking loader.
- Group multiple lazy components under one `Suspense` to avoid nested spinners.

```tsx
import { Suspense, lazy } from "react";
const Settings = lazy(() => import("./Settings"));

export default function Account() {
  return (
    <Suspense fallback={<div>Loading settings…</div>}>
      <Settings />
    </Suspense>
  );
}
```

## Practical notes

- Keep fallbacks small and visually consistent.
- Prefer route-level splits for biggest wins; split deep leaf widgets when large/heavy.
- Combine with bundler hints (webpack/chunk names, vite dynamic import) to keep chunks predictable.
- Metrics to watch: TTI/TTFB, interaction delay, route transition time.

## References

- React docs: https://react.dev/reference/react/Suspense
- Lazy loading: https://react.dev/reference/react/lazy

## Related Notes

- [[react-forwardRef|Forwarding Ref]]
- [[react-optimizing-with-memoization|Optimizing React with Memoization]]
