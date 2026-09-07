---
title: "Mapped Types and Generics"
date: 2025-01-15
tags:
  - typescript
description: "Mapped types and generics in TypeScript"
---

Mapped types and generics are two of TypeScript's most powerful tools for writing reusable, type-safe utilities without duplicating type definitions.

A **generic** lets you write a function or type that works over _any_ type while still preserving type information — think of it as a type-level parameter. A **mapped type** iterates over the keys of an existing type and transforms each one, letting you derive new types mechanically from existing shapes rather than rewriting them by hand.

Together they power TypeScript's built-in helpers (`Readonly`, `Partial`, `Pick`, `Record`) and let you build your own. The rule of thumb: if you find yourself copying an interface just to change one property modifier, a mapped type is the right tool.

The examples below show the pattern from concrete to abstract — first a hand-written mapped type for a specific interface, then the same logic extracted into a generic so it works for any type:

```typescript
// Video for this file:
// https://youtu.be/oGczYPNAs1k
export interface Cat {
  age: number;
  name: string;
  eat(): void;
}

// Readonly mapped type
type ReadonlyCat = {
  readonly [P in keyof Cat]: Cat[P];
};

// Generic readonly
type GenericReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

type ReadonlyCat2 = GenericReadonly<Cat>;

// Make fields optional
type GenericPartial<T> = {
  [P in keyof T]?: T[P];
};

type PartialCat = GenericPartial<Cat>;
type ReadonlyPartialCat = GenericReadonly<PartialCat>;

// Add nullability
type GenericNullable<T> = {
  [P in keyof T]: T[P] | null;
};

type NullableCat = GenericNullable<Cat>;

// Proxy interface
interface Proxy<T> {
  get(): T;
  set(value: T): void;
}

// Reuse an interface; now each T key has a proxied getter/setter
type Proxied<T> = {
  [P in keyof T]: Proxy<T[P]>;
};

type ProxiedCat = Proxied<Cat>;
const cat: ProxiedCat = null as any;
cat.age.get();

// Built-in helpers
type A = Readonly<Cat>;
type B = Partial<Cat>;
type C = Pick<Cat, "age" | "eat">;
```

Reference video: https://youtu.be/oGczYPNAs1k

## Related Notes

- [[typescript-overwrite-types|Overwrite Types]]
