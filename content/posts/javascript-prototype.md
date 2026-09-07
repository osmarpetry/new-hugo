---
title: "Prototype"
date: 2025-01-15
tags:
  - javascript
description: "JavaScript prototype chain and inheritance"
---

Every object in JavaScript has an internal link to another object called its **prototype**. When you access a property that doesn't exist on an object, the engine walks up this chain — prototype by prototype — until it finds the property or reaches `null`. This is the **prototype chain**, and it is the mechanism behind all inheritance in JavaScript.

Understanding prototypes is essential because `class` syntax in ES6 is just syntactic sugar over this system. Under the hood, `extends` sets up the same prototype chain. Knowing the raw model helps debug unexpected property lookups, `instanceof` checks, and performance issues around deep prototype chains.

## The chain in action

```javascript
function talk() {
  console.log(this);
  console.log(this.sound);
}

let animal = {
  talk,
};

let cat = {
  sound: "meow!",
};

Object.setPrototypeOf(cat, animal);

cat.talk(); // `this` is `cat`, but `talk` was found on `animal`
```

`cat` doesn't have a `talk` method, so JavaScript looks up the chain to `animal` and finds it there. This is prototype-based delegation.

## Constructor functions and prototype

Before classes, shared methods were attached to the constructor's `.prototype` property:


```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function () {
  console.log("Hello, my name is " + this.name);
};

var john = new Person("John");

john.sayHello(); // prints "Hello, my name is John"
```

All `Person` instances share the same `sayHello` function via the prototype — it is not copied to each object. This is why prototype-based methods are memory-efficient compared to defining methods inside the constructor.

## Modern equivalent

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  sayHello() {
    console.log("Hello, my name is " + this.name);
  }
}
```

This compiles to the same prototype chain. `Person.prototype.sayHello` is identical in both versions.

## Key rules to remember

- `obj.__proto__` (or `Object.getPrototypeOf(obj)`) points to the prototype.
- Properties are looked up the chain at read time, not copied.
- Assigning a property always writes to the object itself, never to the prototype — shadowing, not mutation.
- `instanceof` checks whether the constructor's `.prototype` appears anywhere in the chain.

## Related Notes

- [[javascript-closures-and-curries|Closures and Curries]]


- [[react-forwardRef|Forwarding Ref]]


- [[javascript-generator|Generator]]

- [[javascript-this-object-inside-call-apply-and-bind|This Object Inside Call, Apply and Bind]]
