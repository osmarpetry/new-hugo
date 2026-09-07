---
title: "Closures and Curries"
date: 2025-01-15
tags:
  - javascript
description: "Closures and currying are both important concepts in JavaScript, especially for functional programming."
---

Closures and currying are both important concepts in JavaScript, especially for functional programming.

## Closure

A closure is a function that has access to its outer scope even after the outer function has returned. It "closes over" its outer scope, hence the name. Here's an example:

```javascript
function outerFunction(x) {
  return function innerFunction(y) {
    return x + y;
  };
}
const add5 = outerFunction(5);
console.log(add5(3)); // 8
```

In the above example, `**innerFunction**` has access to `**x**` even after `**outerFunction**` has returned. This allows us to keep state across multiple invocations of the inner function.
We can use closures to store a function with a first parameter, you can see an example here:
[![](https://paper-attachments.dropbox.com/s_7A088D71FB9B829C04A17241E13BE66493C6164E2DA798BD85C153CC4FEC5AE3_1566590561542_Screenshot+from+2019-08-23+17-02-30.png)](https://paper-attachments.dropbox.com/s_7A088D71FB9B829C04A17241E13BE66493C6164E2DA798BD85C153CC4FEC5AE3_1566590561542_Screenshot+from+2019-08-23+17-02-30.png)

## Curries

Currying, on the other hand, is a technique where we convert a function that takes multiple arguments into a function that takes one argument and returns another function. This allows us to partially apply arguments to a function, making it more composable and reusable. Here's an example:

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(null, args);
    } else {
      return function (...moreArgs) {
        return curried.apply(null, args.concat(moreArgs));
      };
    }
  };
}
function add(a, b, c) {
  return a + b + c;
}
const curriedAdd = curry(add);
const add5 = curriedAdd(5);
console.log(add5(3)(2)); // 10
```

In the above example, we take the `**add**` function and curry it with the `**curry**` function. This allows us to partially apply the `**5**` argument to the `**add**` function, creating a new function `**add5**` that takes two arguments instead of three.

```javascript
const add = function (a, b) {
  return a + b;
};
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2));
```

The example above of simple carry, its looks like closures but not function inside function

## Ramda

Ramda it’s a funcitonal javascript functions based on curry functions

> [!info] Ramda Documentation
> Accepts a converging function and a list of branching functions and returns a new function.
> [https://ramdajs.com/docs/#curry](https://ramdajs.com/docs/#curry)

You can try Ramda functions here:
[https://ramdajs.com/repl/?v=0.28.0](https://ramdajs.com/repl/?v=0.28.0)

## Related Notes

- [[react-forwardRef|Forwarding Ref]]
- [[javascript-generator|Generator]]
- [[javascript-prototype|Prototype]]
- [[javascript-this-object-inside-call-apply-and-bind|This Object Inside Call, Apply and Bind]]
