---
title: "JavaScript Sets, Maps, and Hashing"
date: 2025-02-09
tags:
  - javascript
  - data-structures
description: "Understanding Set vs Map behaviour, hashing, caching patterns, and differences from C#."
---

## TL;DR

- Notes captured on 2025-02-09 during Deveficiente algorithms study.
- Set = unique values with O(1) add/remove; Map = key-value store with O(1) lookups.
- Hashing is reference-based for objects; custom equality needs manual hashing/serialization.
- Useful for caching and deduplication; V8 resolves collisions with internal linked lists/trees.
- C# exposes `GetHashCode`; in JS you must implement equivalent behaviour explicitly.

## Sets

- Store unique values; duplicates are ignored.
- Backed by hash tables in engines like V8.
- Typical operations (`add`, `delete`, `has`) run in O(1) on average.

```js
const set = new Set();
set.add("value1");
set.add("value2");
console.log(set.has("value1")); // true
console.log(set.size); // 2
```

## Maps

- Store key-value pairs; keys can be any data type.
- Also implemented with hashing for O(1) lookups.

```js
const map = new Map();
const key = { id: 1 };
map.set(key, "object");
console.log(map.get(key)); // 'object'
```

## Hashing behaviour

- Objects/arrays are compared by reference. Two objects with identical structure are not equal unless they share the same reference.
- For custom hash keys (similar to C# `GetHashCode`), stringify values or build hashing utilities.

```js
function hashObject(obj) {
  return JSON.stringify(obj);
}
const cache = new Map();
const obj = { id: 1, name: "test" };
cache.set(hashObject(obj), "cached");
```

## Cache patterns

```js
const cache = new Map();

function getData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const value = fetchFromSource(key);
  cache.set(key, value);
  return value;
}
```

## Internal details (V8)

- Hash collisions handled via linked lists or adaptive structures (e.g., small arrays, balanced trees).
- Sparse arrays may convert to hash tables internally for memory efficiency.

## Set vs Map recap

- **Set**: unique values.
- **Map**: key-value pairs, versatile for caching, memoization.

## References

- MDN: [Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set), [Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map).
- V8 blog on hash tables and inline caching.

## Related Notes

- [[javascript-closures-and-curries|Closures and Curries]]
- [[react-forwardRef|Forwarding Ref]]
