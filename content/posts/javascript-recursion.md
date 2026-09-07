---
title: "Recursion"
date: 2025-01-15
tags:
  - algorithms
description: "Recursion concepts and examples"
---

```javascript
let countDownFrom = (num) => {
  if (num === 0) return;
  console.log(num);
  countDownFrom(num - 1);
};

countDownFrom(10);

// Should output
// 10
// 9
// 8
// ...
```

function call themselves - Screenshot from [Fun Fun Function](https://www.youtube.com/@funfunfunction)

```javascript
let categories = [
  { id: "animals", parent: null },
  { id: "mammals", parent: "animals" },
  { id: "cats", parent: "mammals" },
  { id: "dogs", parent: "mammals" },
  { id: "chihuahua", parent: "dogs" },
  { id: "labrador", parent: "dogs" },
  { id: "persian", parent: "cats" },
  { id: "siamese", parent: "cats" },
];

let makeTree = (categories, parent) => {
  let node = {};
  categories
    .filter((c) => c.parent === parent)
    .forEach((c) => (node[c.id] = makeTree(categories, c.id)));
  return node;
};

console.log(JSON.stringify(makeTree(categories, null), null, 2));
```

makeTree(categories, null) - Screenshot from [Fun Fun Function](https://www.youtube.com/@funfunfunction)

Recursion is a technique in programming where a function calls itself repeatedly until a specific condition is met. This allows solving complex problems by breaking them down into smaller, easier to solve sub-problems.

In JavaScript, a recursive function has a base case, which is the condition that stops the recursion, and a recursive case, which is the logic that calls the function again with a modified argument.

Here's an example of a recursive function that calculates the factorial of a number:

```javascript
function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}
```

In this example, the base case is `**if (n === 0)**`, which returns `**1**` and stops the recursion. The recursive case is `**return n * factorial(n - 1)**`, which calls the `**factorial**` function again with `**n - 1**` as an argument.

Recursion can be used to solve many types of problems in JavaScript, including tree traversal, searching and sorting, and more. However, it's important to be careful with recursion, as it can easily lead to infinite loops and stack overflow errors if the base case is not properly defined.

Video from the screenshots:
[http://youtube.com/watch?v=k7-N8R0-KY4](http://youtube.com/watch?v=k7-N8R0-KY4)
