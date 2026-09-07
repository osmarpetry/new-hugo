---
title: "This Object Inside Call, Apply and Bind"
date: 2025-01-15
tags:
  - javascript
description: "How the this keyword works in JavaScript across four binding rules — implicit, explicit (.call, .apply, .bind), new, and window binding — with practical examples."
---

JavaScript has four rules that determine what `this` refers to inside a function: implicit binding, explicit binding (`.call`, `.apply`, `.bind`), `new` binding, and window binding. Understanding these rules is essential because `this` behaves differently depending on how and where a function is called — not where it is defined.

At **AutoLot**, the car dealership platform, the team kept running into bugs where `this` was `undefined` or pointed to `window` instead of the expected object. Once they mapped each scenario to one of the four binding rules, those bugs disappeared.

## Implicit Binding — left of the dot at call time

The most common rule: when a function is called as a method of an object, `this` refers to the object to the left of the dot.

At AutoLot, the `Person` factory function creates salesperson objects. Each salesperson has a `sayName` method and a nested `mother` object with its own `sayName`. The key insight: `this` is determined by what's to the left of the dot at call time, not at definition time.

```javascript
/*
 - Implicit Binding
 - Explicit Binding
 - new Binding
 - window Binding
*/

// Implicit Binding
// Left of the Dot at Call Time

var Person = function (name, age) {
  return {
    name: name,
    age: age,
    sayName: function () {
      console.log(this.name);
    },
    mother: {
      name: "Stacey",
      sayName: function () {
        console.log(this.name);
      },
    },
  };
};

var jim = Person("Jim", 42);
jim.sayName(); // 'Jim' — this = jim (left of the dot)
jim.mother.sayName(); // 'Stacey' — this = jim.mother (left of the dot)
```

When `jim.sayName()` is called, the object to the left of `.sayName()` is `jim`, so `this.name` is `'Jim'`. When `jim.mother.sayName()` is called, the object to the left of `.sayName()` is `jim.mother`, so `this.name` is `'Stacey'`. The function is the same shape, but `this` changes based on how it's called.

At AutoLot, this rule explains why the vehicle detail page works correctly: `vehicle.showPrice()` always uses the vehicle's own price because `vehicle` is to the left of the dot.

## Explicit Binding with .call()

`.call` invokes the function immediately. The first argument becomes the `this` context, and any remaining arguments are passed directly to the function.

At AutoLot, the `sayName` function isn't attached to any object — it's standalone. The team needs to run it in the context of a specific salesperson (`stacey`) while passing her known languages:

```javascript
// Explicit Binding
// call, apply, bind

var sayName = function (lang1, lang2, lang3) {
  console.log(
    "My name is " +
      this.name +
      " and I know " +
      lang1 +
      ", " +
      lang2 +
      ", and " +
      lang3,
  );
};

var stacey = {
  name: "Stacey",
  age: 34,
};

var languages = ["JavaScript", "Ruby", "Python"];

sayName.call(stacey, languages[0], languages[1], languages[2]);
// 'My name is Stacey and I know JavaScript, Ruby, and Python'
```

The first argument to `.call` (`stacey`) becomes `this` inside `sayName`. The remaining arguments (`languages[0]`, `languages[1]`, `languages[2]`) are passed as `lang1`, `lang2`, `lang3`. At AutoLot, the team uses `.call` when they need to run a shared `calculateCommission` function once in the context of a specific salesperson.

## Explicit Binding with .apply()

`.apply` is identical to `.call`, but instead of passing arguments individually, you pass them as a single array:

```javascript
var sayName = function (lang1, lang2, lang3) {
  console.log(
    "My name is " +
      this.name +
      " and I know " +
      lang1 +
      ", " +
      lang2 +
      ", and " +
      lang3,
  );
};

var stacey = {
  name: "Stacey",
  age: 34,
};

var languages = ["JavaScript", "Ruby", "Python"];

sayName.apply(stacey, languages);
// 'My name is Stacey and I know JavaScript, Ruby, and Python'
```

Notice the difference: with `.call` we had to write `languages[0], languages[1], languages[2]`, but with `.apply` we just pass the `languages` array directly. JavaScript unpacks it automatically. A common mnemonic: **a**pply takes an **a**rray.

At AutoLot, when the vehicle filter component collects user selections into an array (like `['SUV', '2024', 'Honda']`), `.apply` lets the team pass that array directly to a search function bound to a specific dealership context.

## Explicit Binding with .bind()

`.bind` does not invoke the function immediately — it returns a new function with the `this` context permanently set. This is the critical difference from `.call` and `.apply`.

```javascript
var sayName = function (lang1, lang2, lang3) {
  console.log(
    "My name is " +
      this.name +
      " and I know " +
      lang1 +
      ", " +
      lang2 +
      ", and " +
      lang3,
  );
};

var stacey = {
  name: "Stacey",
  age: 34,
};

var languages = ["JavaScript", "Ruby", "Python"];

var newFn = sayName.bind(stacey, languages[0], languages[1], languages[2]);
console.log("HERE");
newFn();
// 'HERE'
// 'My name is Stacey and I know JavaScript, Ruby, and Python'
```

Notice that `'HERE'` is logged first — `.bind` doesn't execute the function, it creates a new one. Only when `newFn()` is called does the output appear. This is why `.bind` is the go-to method for React event handlers and `setTimeout` callbacks at AutoLot: it lets the team pre-configure the `this` context without triggering the function immediately.

## Window Binding — with use strict

When a function is called without any object context (no dot, no `.call`, no `.bind`), JavaScript needs to decide what `this` should be. In strict mode, `this` is `undefined`, which causes a `TypeError` if you try to access a property on it:

```javascript
// window Binding
var sayAge = function () {
  "use strict";
  console.log(this.age);
};

var me = {
  age: 25,
};

sayAge();
// TypeError: Cannot read property 'age' of undefined
```

Even though `me` exists with `age: 25`, `sayAge()` is called without any context — there's nothing to the left of the dot, and no `.call`/`.bind` was used. In strict mode, `this` is `undefined`, so `this.age` throws an error.

At AutoLot, the entire codebase runs in strict mode (enabled by ES modules and TypeScript). This is a good thing — it surfaces bugs immediately instead of silently reading from `window`.

## Window Binding — without strict mode

Without strict mode, `this` inside a standalone function call defaults to the global `window` object. This can lead to confusing behavior:

```javascript
// window Binding
var sayAge = function () {
  console.log(this.age);
};

var me = {
  age: 25,
};

sayAge(); // undefined — this is window, window.age doesn't exist yet
window.age = 35;
sayAge(); // 35 — this is window, and now window.age is 35
```

The first `sayAge()` call logs `undefined` because `this` is `window` and `window.age` hasn't been set. After `window.age = 35`, the second `sayAge()` logs `35` — not because `me` changed, but because `this` is still `window` and now it has an `age` property.

At AutoLot, this is exactly the kind of phantom data bug the team saw in their early prototypes: a `formatPrice` function was reading `this.currency`, but `this` was `window`, which happened to have a `currency` property set by a third-party analytics script. Strict mode and explicit binding eliminated this entire class of bugs.

## Quick reference

| Method     | Invokes immediately? | Arguments format | Use case                                      |
| ---------- | -------------------- | ---------------- | --------------------------------------------- |
| `.call()`  | Yes                  | Individual args  | One-off invocation with specific context      |
| `.apply()` | Yes                  | Array of args    | When args are already in an array             |
| `.bind()`  | No (returns new fn)  | Individual args  | Callbacks, event handlers, deferred execution |

## Related Notes

- [[javascript-closures-and-curries|Closures and Curries]]
- [[react-forwardRef|Forwarding Ref]]
- [[javascript-generator|Generator]]
- [[javascript-prototype|Prototype]]
