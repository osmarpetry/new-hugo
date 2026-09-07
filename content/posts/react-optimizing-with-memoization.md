---
title: "Optimizing React with Memoization"
date: 2025-01-15
tags:
  - react
  - performance
description: "Optimizing React applications with memoization techniques"
---

## Introduction

It’s important to understand the component lifecycle and when to re-render. Some tips to optimize React include:

- Use useMemo or memo to memoize expensive calculations or component render.
- Use useCallback to memoize callback functions.
- Use React.PureComponent instead of React.Component for pure components.
- Use shouldComponentUpdate lifecycle method to avoid unnecessary re-renders.
- Avoid using the state for non-essential data that does not affect the render.
- Avoid using too many inline functions and use memoized callback functions instead.
  It is important to note that the most important aspect of optimization is to understand the performance bottlenecks in your application and address them accordingly.

## useMemo

This is a hook that is used to memoize a component's expensive calculations. It helps to reduce the number of re-renders by only recalculating the value when one of its dependencies has changed. It takes two arguments, the first being a calculation function and the second being an array of dependencies. If the dependencies change, the calculation function will be re-executed, otherwise, the previously calculated value is returned, example:

```javascript
const memoizedValue = useMemo(() => expensiveCalculation(a, b), [a, b]);
```

## memo

it’s a higher-order component (HOC) that is used to wrap a component and memoize its render. It works similarly to useMemo, but is used when wrapping a component instead of within a component, example:

```javascript
const MemoizedComponent = memo(MyComponent);
```

## useCallback

The useCallback is a hook that is used to memoize a callback function. It helps to reduce the number of unnecessary re-creates of the callback function by only re-creating it when one of its dependencies changes. It takes two arguments, the first being the callback function and the second being an array of dependencies, example:

```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

## React Profiler

The React Profiler tool is used to measure the performance of React components. It can be used to identify which components are slow, what the render time is, and which parts of the component tree are taking the most time. The React Profiler tool can be used by wrapping the component with the Profiler component and passing it a callback function that is called every time the component is updated.

Check more details here inside the documentation [here inside the documentation.](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)

## What’s Shallow comparation? How to avoid it?

Shallow comparison is a term used in React when referring to the comparison of objects and arrays in the useMemo and memo hooks. Shallow comparison means that only the first level of the object or array is compared, and not the nested properties or elements.

For example, if you are memoizing an object with the useMemo hook, React will only compare the reference of the object, and not the values of the properties within the object. If the reference of the object changes, React will consider the object as having changed and re-render the component. However, if you change a nested property of the object, React will not detect the change and the component will not re-render.

Shallow comparison is used in React for performance reasons, as deep comparison can be computationally expensive. In most cases, shallow comparison is sufficient, but in some cases it can lead to unexpected results, especially when memoizing objects or arrays with nested properties. In these cases, you may need to use a custom hook with a deep comparison mechanism, such as the useDeepMemo hook that I will mention inside this section.

### useDeepMemo

React's built-in hooks, useMemo and memo, perform shallow comparisons, which means that they only compare the values of the first level of an object or array. This can lead to unexpected results when trying to memoize objects, as changing a nested property of an object would not trigger a re-render.

To memoize an object with React, you can create a custom hook that performs a deep comparison of the object. You can use the Lodash library's isEqual function to perform a deep comparison of the objects.

Here's an example of how to memoize an object with React:

```javascript
import { isEqual } from "lodash";
import { useMemo } from "react";
const useDeepMemo = (obj, deps) => {
  return useMemo(() => obj, isEqual(deps, [obj]));
};
const MyComponent = ({ obj }) => {
  const memoizedObj = useDeepMemo(obj, [obj]);
  // ...
};
```

In this example, the custom hook useDeepMemo uses the isEqual function from Lodash to perform a deep comparison of the object and its dependencies. The hook takes the object and its dependencies as arguments and returns the object if the deep comparison of the dependencies and the object is equal. This ensures that th object is only re-computed if it has actually changed.

### useDeepCallback

When you want to memoize a function, you can use the useCallback hook along with the custom useDeepMemo hook to perform a deep comparison of the function and its dependencies.

Here's an example of how to memoize a function with React:

```javascript
import { isEqual } from "lodash";
import { useMemo, useCallback } from "react";
const useDeepMemo = (value, deps) => {
  return useMemo(() => value, isEqual(deps, [value]));
};
const useDeepCallback = (callback, deps) => {
  return useDeepMemo(useCallback(callback, deps), [callback, deps]);
};
const MyComponent = ({ obj, handleClick }) => {
  const memoizedHandleClick = useDeepCallback(handleClick, [handleClick, obj]);
  // ...
  return <button onClick={memoizedHandleClick}>Click Me</button>;
};
```

In this example, the custom hook useDeepCallback uses the useCallback hook and the custom useDeepMemo hook to memoize the handleClick function. The hook takes the callback function and its dependencies as arguments and returns the memoized callback function. The deep comparison performed by the useDeepMemo hook ensures that the function is only re-computed if it has actually changed.

## When not use memoize functions in React!

More important than know how to use memoize corretly, it’s how to NOT use memoize functions

1. The component being memoized is small and simple, and the performance impact of re-rendering is not significant. In this case, using memoize functions can add unnecessary complexity to the code.
2. The dependencies of the memoized value are changing frequently and the memoized value is being re-computed unnecessarily. In this case, memoization can actually reduce performance.
   The React Profiler tool can be used to determine if memoization is necessary for a specific component. The React Profiler tool provides a visual representation of the render performance of a React application, allowing you to identify which components are re-rendering unnecessarily. If a component is re-rendering frequently and the performance impact is significant, it may be necessary to use memoization to improve the performance of the application.

Visual example from [https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html), to use the React Profiler tool, simply wrap the component you want to profile with the Profiler component and provide a callback function to receive performance information. The callback function will be called every time the component re-renders, providing information about the render time, the number of updates, and the type of updates. You can use this information to determine if memoization is necessary for the component, and to optimize the performance of the application.

## Conclusion

In conclusion, useMemo, memo, and useCallback should be used when there is a need to optimize performance by avoiding unnecessary re-renders. The React Profiler tool should be used to measure the performance of React components and identify areas that can be optimized.

Code I created to have the context for this small article
https://github.com/osmarpetry/react-performance-tips

## Related Notes

- [[react-forwardRef|Forwarding Ref]]
- [[react-suspense|React.Suspense]]
- [[react-useref|useRef]]
