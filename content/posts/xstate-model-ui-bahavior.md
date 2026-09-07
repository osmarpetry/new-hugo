---
title: "XState — model UI behavior correctly and make it testable"
date: 2025-07-12
tags:
  - frontend
  - javascript
  - testing
description: "State modeling in React with XState: finite states, events, guards, effects. Clear behavior and cheap tests."
---

## The problem we're solving

Imagine you join a company that runs an e-commerce platform. Product asks you to build a **search page** — the kind of page every user hits dozens of times a day. It sounds simple: a text input, a button, show results.

But then reality kicks in. The page has to handle empty queries, network failures, slow connections, retries, and race conditions where a user submits a second search before the first one finishes. A junior developer might reach for a handful of `useState` calls — `isLoading`, `hasError`, `data`, `submitted` — and suddenly you're juggling four booleans that produce sixteen possible combinations. Most of those combinations are impossible, but nothing in the code prevents them. A loading spinner stays visible after an error. A success message flashes before the data arrives. Bugs creep in not because the developer made a logic error, but because the **model itself was never defined**.

This is the core insight behind state machines: **if you can't name the state your UI is in, you can't reason about it**. And if you can't reason about it, you can't test it.

---

## The company goal

The company wants the search page to be **predictable and trustworthy**. That means three things:

1. **No impossible states.** The page is either idle, loading, showing results, or showing an error. Never two of those at the same time.
2. **Clear transitions.** Every change happens because of a named event — `SUBMIT`, `RESOLVE`, `REJECT`, `RETRY` — not because some deeply nested callback flipped a boolean.
3. **Cheap, confident tests.** QA shouldn't need a browser to verify that submitting an empty query does nothing, or that a network error leads to the failure screen and not a blank page.

XState lets us achieve all three by modeling the page behavior as a **finite state machine** — a single object that declares every state, every event, and every rule for moving between them.

---

## How a state machine models the page

A state machine has a few building blocks. Each one maps directly to something visible on the search page:

**States** are the screens the user sees. They are mutually exclusive — the page is in exactly one state at any moment: `idle`, `loading`, `success`, or `failure`.

**Events** are things that happen: the user clicks "Go" (`SUBMIT`), the API responds with data (`RESOLVE`), the API fails (`REJECT`), the user clicks "Try again" (`RETRY`).

**Guards** are conditions that must be true before a transition fires. For instance, `SUBMIT` only moves the page to `loading` if the query is not empty. This single guard eliminates an entire class of bugs where the page fires off a request with no search term.

**Actions** are synchronous side-effects that run during a transition — storing the query in context, saving the response data, or recording the error message.

**Services** are the asynchronous work — the actual API call. The machine invokes the service when it enters `loading` and waits for either `RESOLVE` or `REJECT`. There is no way for the page to "forget" it's waiting, because the machine literally cannot leave `loading` without one of those two events.

**Determinism** ties it together: given any `(state, event)` pair, the next state is always the same. No surprises, no timing-dependent bugs, no hidden flags.

---

## Building the machine (TypeScript)

Here's the search machine. Notice how the entire page behavior fits in one declarative object:

```ts
import { createMachine, assign } from "xstate";

type Ctx = { query: string; data?: unknown; error?: string };
type Ev =
  | { type: "SUBMIT"; query: string }
  | { type: "RESOLVE"; data: unknown }
  | { type: "REJECT"; error: string }
  | { type: "RETRY" };

export const searchMachine = createMachine<Ctx, Ev>(
  {
    id: "search",
    initial: "idle",
    context: { query: "" },
    states: {
      idle: {
        on: {
          SUBMIT: {
            target: "loading",
            cond: "hasQuery",
            actions: "setQuery",
          },
        },
      },
      loading: {
        invoke: { src: "runSearch" },
        on: {
          RESOLVE: { target: "success", actions: "setData" },
          REJECT: { target: "failure", actions: "setError" },
        },
      },
      success: { on: { RETRY: "idle" } },
      failure: { on: { RETRY: "idle" } },
    },
  },
  {
    guards: {
      hasQuery: (_ctx, ev) =>
        ev.type === "SUBMIT" && ev.query.trim().length > 0,
    },
    actions: {
      setQuery: assign((ctx, ev) =>
        ev.type === "SUBMIT" ? { ...ctx, query: ev.query } : ctx,
      ),
      setData: assign((ctx, ev) =>
        ev.type === "RESOLVE"
          ? { ...ctx, data: ev.data, error: undefined }
          : ctx,
      ),
      setError: assign((ctx, ev) =>
        ev.type === "REJECT"
          ? { ...ctx, error: ev.error, data: undefined }
          : ctx,
      ),
    },
  },
);
```

Read it top to bottom and you know everything the page can do. There's no hidden state, no forgotten edge case. If a product manager asks "what happens when the API fails?", you point to `failure` and its single outbound transition: `RETRY → idle`.

---

## Connecting it to React

The machine holds the logic; the component just renders whatever state it's in. This separation is the key to keeping components thin and testable.

```tsx
import { useMachine } from "@xstate/react";
import { searchMachine } from "./machine";

export function SearchBox() {
  const [state, send] = useMachine(searchMachine, {
    services: {
      runSearch: async (ctx) => {
        const r = await fetch(`/api/search?q=${encodeURIComponent(ctx.query)}`);
        if (!r.ok) throw new Error("network");
        return r.json();
      },
    },
  });

  return (
    <div>
      {state.matches("idle") && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const q = new FormData(form).get("q") as string;
            send({ type: "SUBMIT", query: q });
          }}
        >
          <input name="q" placeholder="Search..." />
          <button type="submit">Go</button>
        </form>
      )}

      {state.matches("loading") && <p>Loading…</p>}
      {state.matches("success") && (
        <pre>{JSON.stringify(state.context.data, null, 2)}</pre>
      )}
      {state.matches("failure") && (
        <div>
          <p role="alert">Error: {state.context.error}</p>
          <button onClick={() => send({ type: "RETRY" })}>Try again</button>
        </div>
      )}
    </div>
  );
}
```

Every `state.matches(...)` block corresponds to exactly one state in the machine. There is no `if (isLoading && !hasError && data === null)` guesswork. The component asks the machine "where are we?" and renders accordingly.

---

## Testing without a browser

Because the machine is pure logic — no DOM, no React, no network — you can test it as a plain function. Send events in, assert which state comes out.

```ts
import { searchMachine } from "./machine";
import { createActor } from "xstate";

test("happy path", async () => {
  const actor = createActor(
    searchMachine.provide({
      guards: searchMachine.options!.guards!,
      actions: searchMachine.options!.actions!,
      services: {
        runSearch: async () => ({ ok: true }),
      },
    }),
  ).start();

  actor.send({ type: "SUBMIT", query: "xstate" });
  expect(actor.getSnapshot().value).toBe("loading");

  actor.send({ type: "RESOLVE", data: { ok: true } });
  expect(actor.getSnapshot().value).toBe("success");
});
```

This test runs in milliseconds. No rendering, no mocking `fetch` globally, no waiting for `useEffect`. If the test passes, you know the page transitions correctly from idle to loading to success. You can write the same style of test for the error path, the empty-query guard, or any other branch — all with the same lightweight pattern.

Beyond hand-written tests, **model-based testing** takes this further: the test runner automatically walks every reachable path through the machine, so you don't have to write each scenario by hand. Pair that with **XState Inspect** — a browser devtool that visualises every transition in real time — and you get both confidence and visibility into how the page actually behaves.

---

## When to reach for a state machine

Not every component needs one. A toggle button or a simple form field doesn't justify the ceremony. But when you're dealing with flows that have **three or more states**, tricky branches, or async work that can fail and retry, a state machine pays for itself quickly. It gives you a **single source of truth** for both UI rendering and business transitions, **predictability** that any `(state, event)` pair always produces the same result, and **guards** that make impossible transitions literally unreachable.

If a product manager can look at your machine definition and understand what the page does, you've succeeded.

---

## Template

When starting a new machine from scratch, this is the skeleton:

```ts
createMachine<Ctx, Ev>(
  {
    id: "<name>",
    initial: "<state>",
    context: {
      /* … */
    },
    states: {
      /* stateA: { on: { EVENT: { target: 'stateB', cond, actions } } } */
    },
  },
  {
    guards: {
      /* … */
    },
    actions: {
      /* … */
    },
    services: {
      /* … */
    },
  },
);
```

---

## References

- Course: **State Modeling in React with XState** — David Khourshid (Frontend Masters).
- Library: XState docs and @xstate/react examples.

## Related Notes

- [[react-forwardRef|Forwarding Ref]]
