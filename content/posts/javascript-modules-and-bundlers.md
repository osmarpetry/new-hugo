---
title: JavaScript Modules and Bundlers
date: 2026-03-23
tags:
  - javascript
  - bundlers
  - modules
description: "JavaScript module systems (IIFE, CommonJS, ESModules), modern bundlers, and build types for apps and libraries"
---

The goal here is to understand JavaScript module systems (IIFE, CommonJS, ESModules), how modern bundlers sit on top of them, and which build types to use for business apps and component libraries.

Module systems describe **how code is organized and imported/exported** at the language level. Bundlers and build tools **consume those modules** and produce optimized outputs for different environments (browser, Node, CDN, etc.).

---

## Part 1 — Module Systems

### IIFE (Immediately Invoked Function Expression)

IIFEs are the classic pattern to create a private scope and avoid polluting `window`, often combined with a single global namespace like `App`.

First, I created the object where the modules will be placed into. Then I write the module functions for the parent:

```js
var App = App || {};

App.Utils = (function () {
  function sanitize(str) {
    return str.trim();
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return {
    sanitize: sanitize,
    capitalize: capitalize,
  };
})();
```

I write the parent module, then the other modules. Here the order matters:

```js
var App = App || {};

App.Users = (function (Utils) {
  var users = ["Tyler", "Sarah", "Dan"];

  function getUsers() {
    return users.map(Utils.capitalize);
  }

  function firstUser() {
    return Utils.sanitize(users[0]);
  }

  return {
    getUsers: getUsers,
    firstUser: firstUser,
  };
})(App.Utils);
```

**Drawbacks:**

- **Order matters:** you must load scripts in the correct sequence.
- **Name collisions:** if another third-party module uses the name `App`, it conflicts with ours.

Today IIFEs are mostly seen as a _target output format_ from bundlers (for `<script src="...">` on a CDN) rather than something you hand-write.

### CommonJS

CommonJS (`require`, `module.exports`) is the historical Node.js module system.

**Different from IIFE:**

- No need to pack modules in IIFEs
- No need to care about import order
- Nothing exported to the global scope (like the `App` object)
- Still essentially exporting an object with functions inside

```js
// users.js
var users = ["Tyler", "Sarah", "Dan"];

module.exports = {
  getUsers: function () {
    return users;
  },
  sortUsers: function () {
    return users.sort();
  },
  firstUser: function () {
    return users[0];
  },
};
```

**Pros:** Built into Node.js by default.
**Cons:** Not natively supported in browsers. Synchronous `require` — fine for server (local filesystem), but bundlers must transform it for the browser.

For new code, CommonJS is still relevant mainly for legacy Node ecosystems (older tools, Jest configs, etc.) and as an output format for libraries that need to run in older Node versions.

### ESModules (ESM)

ESModules (`import` / `export`) are the standardized modern module system, introduced in ES6. They work in both browsers and Node.

**Key characteristics:**

- Native in browsers via `<script type="module">` and in modern Node via `"type": "module"` or `.mjs`.
- **Statically analyzable:** bundlers can see the full dependency graph at build time, enabling safe tree-shaking of unused exports.
- In browsers, `<script type="module">` is "defer-like": it loads in parallel and executes after HTML parsing, with dependency-aware ordering.

ESModules differ from the previous systems:

- IIFEs don't provide a way to export/import functionality between files.
- CommonJS doesn't work natively in the browser. Its exports are properties on `module.exports`, required at runtime.
- ESModules use `import` and `export` keywords with syntax suited to both browser and server. Dependencies are determined at build time, not runtime.

#### ESModules code example

```js
// utils.js

// Not exported — private to this module
function once(fn, context) {
  var result;
  return function () {
    if (fn) {
      result = fn.apply(context || this, arguments);
      fn = null;
    }
    return result;
  };
}

// named export
export function first(arr) {
  return arr[0];
}

// named export
export function last(arr) {
  return arr[arr.length - 1];
}

// default export
export default function leftpad(str, len, ch) {
  var pad = "";
  while (true) {
    if (len & 1) pad += ch;
    len >>= 1;
    if (len) ch += ch;
    else break;
  }
  return pad + str;
}
```

#### ESModule imports

```js
import leftpad, { first, last } from "./utils";
```

Note that `leftpad` is the default export (a single function), not the entire module like in CommonJS.

#### Dynamic import (async loading)

Static `import` declarations are resolved at build/load time. For on-demand, asynchronous loading you use dynamic `import()`:

```js
const { renderDashboard } = await import("./dashboard.js");
renderDashboard();
```

Dynamic `import()` is part of the ES module spec and widely supported in modern browsers. Bundlers use it as the hint for **code splitting** — automatically creating separate chunks that are loaded only when needed.

#### Practical takeaway

For new projects and libraries, write everything as ESModules. Treat CommonJS mainly as interoperability with older tooling.

---

## Part 2 — Module Bundlers

Browsers and Node can understand ESModules directly, but real-world apps need more: TypeScript/JSX/SASS transpilation, code splitting, tree-shaking, minification, and bundling dependencies into optimized chunks. Bundlers read your ESM/CommonJS/TS graph and emit one or more outputs (browser bundles, Node bundles, library packages).

### Webpack

Very mature and extremely configurable, with a huge ecosystem of loaders and plugins. Good for large, complex apps that need fine-grained control over asset types, caching, and legacy browser support.

**Downside:** Config complexity and slower builds compared to newer Rust/Go-based tools.

### Rollup

Focused on bundling libraries and ESM. Produces clean, tree-shaken bundles with multiple output formats (ESM, CJS, UMD, IIFE). Common choice for UI/component libraries and packages published to npm.

### Parcel

Zero-config, batteries-included bundler: point it at an entry and it auto-detects assets and sensible defaults. Great for small–medium apps, prototypes, and teams that don't want to handcraft webpack-style configs. Less ideal for deeply customized build pipelines.

### Vite

Strictly speaking, Vite is a **dev server + build tool** that uses other bundlers under the hood:

- **Dev:** uses esbuild and native ESM to transform modules on demand with extremely fast HMR.
- **Production:** uses Rollup to perform final bundling and code splitting, with esbuild for transpilation/minification.

First-class integration with Vue, React, Svelte, Solid, etc. Default in many framework starter templates.

### esbuild

Go-based bundler and transpiler optimized for raw speed — often orders of magnitude faster than JS-based tools. Used directly (CLI/JS API) or under the hood in other tools (Vite, newer frameworks) for transforming dependencies and minifying. Great for custom tooling, small apps, or as the core of simple library builds.

### Rspack

High-performance bundler written in Rust, designed as a near **drop-in replacement for Webpack** but much faster. Strong compatibility with Webpack's ecosystem and config model, supports React/Vue/Svelte, handles JS/TS/CSS/HTML/JSON. Good candidate when you have an existing webpack architecture but want Rust-level speed.

### Turbopack

Rust-based successor to Webpack, created by Vercel, tightly integrated with **Next.js**. Focused on incremental and parallel bundling to keep dev server fast even with very large codebases. Most people encounter Turbopack via Next.js rather than configuring it standalone.

### Recommended bundler by use case

| Scenario                               | Recommended tools                                   | Why                                                                                                                                             |
| -------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| SPA / dashboard app (React/Vue/Svelte) | Vite; or Webpack/Rspack for legacy/enterprise       | Vite gives fast dev server, Rollup-based prod builds, big ecosystem. Webpack/Rspack when you need tight control or already have webpack configs |
| Component library / design system      | Rollup, esbuild-based tools (`tsup`)                | Clean multi-format output (ESM + CJS + UMD/IIFE), strong tree-shaking, simple config                                                            |
| Large Next.js app                      | Next.js with Turbopack                              | Deep framework integration and incremental Rust bundling for large monorepos                                                                    |
| Brownfield webpack app (slow builds)   | Rspack as drop-in, or progressive migration to Vite | Rspack reuses most webpack config on Rust; Vite is more opinionated but nicer DX                                                                |
| Quick prototype / small internal tool  | Parcel, Vite                                        | Minimal config, fast feedback; migrate to more custom setups later if needed                                                                    |

---

## Part 3 — Build Types and When to Use Each

Think in terms of two axes: the **target environment** (browser app, Node app, library) and the **optimization level** (dev vs production, SSR vs CSR).

### 1) Development builds

Unminified, rich source maps, very fast rebuilds/HMR. Served by Vite dev server, webpack dev server, Next dev, etc.

**Use:** always during local development; never ship these bundles to users.

### 2) Production app builds (browser)

Minified JS/CSS, tree-shaken, code-split into chunks, hashed filenames for long-term caching. Often separate "modern ESM" and "legacy" bundles when supporting older browsers, using `<script type="module">` plus `<script nomodule>` fallbacks.

**Use:** SPAs, dashboards, marketing sites — anything where JS runs in the browser.

### 3) SSR / SSG builds

Frameworks like Next.js, Nuxt, SvelteKit, Vite SSR produce two main artifacts: a **server bundle** (Node/edge, usually ESM or CJS) to render HTML on the server, and a set of **client bundles** (browser) that hydrate the UI and handle interactions.

**Use when you need:** better SEO or faster time-to-first-paint, personalized dynamic content combined with SPA interactivity.

### 4) Library builds

For a component library published to npm, a typical output set is:

- **`module` (ESM):** for modern bundlers and Node ESM consumers.
- **`main` (CJS):** for older Node/tools.
- **Optional UMD/IIFE:** for direct `<script>` usage from a CDN.
- **Type declarations (`.d.ts`):** if using TypeScript.

**Best practices:** mark React/Vue/etc. as `peerDependencies` (don't bundle them — let the consumer's bundler handle that). Design modules so tree-shaking works: one component per file, named exports when appropriate.

### 5) "No-bundler" / native ESM builds

For small apps or micro-frontends, serve `.js` files directly using `<script type="module">` and rely on the browser's native module loader.

**Use cases:** tiny widgets, static pages with a little JS, internal tools where network overhead and legacy browser support don't matter much. You may still run a minimal build step (e.g., TypeScript → JS) without full bundling.

---

## Concrete Advice for Business Apps + Component Libraries

**For new apps:** default to a Vite-based stack (or a framework that embeds Vite) unless you're forced onto webpack. This gives you a fast dev cycle and good production output with little config.

**For a component library:** use Rollup or an esbuild-based tool (like `tsup`) to emit ESM + CJS (and optionally UMD/IIFE). Publish as an npm package, keeping React/Vue/etc. as peer deps.

These choices align with ESModules, give solid performance, and keep build config understandable.

## Related Notes

- [[javascript-closures-and-curries|Closures and Curries]]
- [[react-forwardRef|Forwarding Ref]]
- [[javascript-generator|Generator]]
