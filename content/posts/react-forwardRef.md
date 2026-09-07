---
title: React ForwardRef
date: 2025-01-15
tags:
  - react
  - javascript
  - frontend
description: Forwarding Refs is a technique in React where you pass a ref from a parent component to a child component
---

By default, React does not let a parent component access the DOM node of a child component. `forwardRef` breaks that boundary explicitly — the child opts in to exposing its DOM node (or instance) to whoever holds the ref.

The typical need is imperative control from a parent: focusing an input inside a design-system `<Input>` wrapper, scrolling a `<List>` to a specific row, or triggering animations on a child element. Without `forwardRef`, the parent would need to own the DOM directly, which defeats the purpose of encapsulation.

## The problem it solves

When you wrap a native element in a component, `ref` stops working from the parent:

```jsx
// This does NOT work — ref lands on the component, not the <input>
const Input = (props) => <input {...props} />;
const ref = useRef();
<Input ref={ref} />; // ref.current is null
```

`forwardRef` fixes this by threading the ref through:

```javascript
import React, { useRef, forwardRef } from "react";

const Input = forwardRef((props, ref) => {
  return (
    <div>
      <input type="text" ref={ref} />
    </div>
  );
});

const App = () => {
  const inputRef = useRef();
  const handleClick = () => {
    inputRef.current.focus();
  };
  return (
    <div>
      <Input ref={inputRef} />
      <button onClick={handleClick}>Focus Input</button>
    </div>
  );
};
export default App;
```

## When to use

- Design system primitives (`Input`, `Button`, `Modal`) that need to expose their inner DOM.
- Animation libraries that need direct DOM access on wrapped components.
- Any component that wraps a focusable or scrollable element.

## Anti-patterns

- **Don't use it by default.** Exposing DOM nodes breaks encapsulation. Only add `forwardRef` when there's a concrete, documented reason.
- **Avoid exposing too much.** If callers need complex imperative control, prefer `useImperativeHandle` to expose a limited API instead of the raw DOM node.
- **Don't use it as a workaround for missing state.** If the parent needs to _react_ to changes in the child, use callbacks or lifted state — not refs.

## Related Notes

- [[react-optimizing-with-memoization|Optimizing React with Memoization]]
- [[react-suspense|React.Suspense]]
- [[react-useref|useRef]]
