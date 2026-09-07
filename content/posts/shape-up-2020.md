---
title: "Shape Up: Stop Running in Circles and Ship Work that Matters"
date: 2025-01-15
tags:
  - project-management
  - workflow
  - software-architecture
description: Notes and practice guide merging book takeaways and course review on Shape Up by Ryan Singer, connected with The Mythical Man-Month, Design by Contract, Programming with Abstract Data Types, and Domain-Driven Design.
---

## Summary

In December 2020 I read several books and papers: **The Mythical Man-Month**, **Design by Contract**, **Programming with Abstract Data Types**, **Shape Up**, and **Domain-Driven Design**. Their ideas map directly to problems and solutions I encountered building apps in recent years.
The largest recurring gap in real projects is the **beginning**—how we **shape** and refine the work—more than the middle or the end. **Shape Up** gives a concrete way to close that gap in modern teams.

## First-planning approach

The “second-system effect” described in _The Mythical Man-Month_ is largely a **waterfall** failure. Prefer an **incremental build**:

- Create a runnable end-to-end **skeleton** early.
- Iterate: compile, test, debug, then fill modules.
- Ship small. Test with users early.
- Keep something always shippable: CI, TDD, frequent deploys, stable staging.

**Shape Up** maps this incremental thinking to today’s agile culture while improving focus and motivation.

## Shape Up pitch path

> 1. **Problem** — the raw idea or use case that motivates the work
> 2. **Appetite** — how much time we will spend and how that constrains the solution
> 3. **Solution** — the core elements presented so people can immediately understand
> 4. **Rabbit holes** — details worth calling out to avoid traps
> 5. **No-Goes** — anything explicitly out of scope to fit the appetite

Use this pitch to make trade-offs explicit upfront and to keep the build inside the appetite.

## Course notes and tools (practice)

- Use **Basecamp** to mirror the shaping → betting → building flow. It keeps work visible and time-boxed.
- During **Betting**, bring the shaping context to the bet team so they can immerse quickly and **go build** without re-shaping mid-cycle.

## Requirements backbone that supports Shape Up

From _Software Engineering (9th ed., Sommerville)_, keep **functional** and **non-functional (quality)** requirements as guardrails while shaping:

- **Functional requirements** define the behavior we agree to ship inside the cycle.
- **Quality attributes** (performance, reliability, usability, etc.) set acceptance bars that prevent rework later.

## Practical steps to refine (“grind”) a requirement

Run this checklist before you place a bet:

1. **Reach the originator**. Talk to the person who proposed the idea.
2. **Interview the requester**. Capture intent, constraints, and concrete examples.
3. **Double-check understanding**. Close the loop quickly with short written confirmations.
4. **Materialize the idea**. Sketch flows, states, and boundaries.
5. **Specify test scenarios**. Cover success, edge, and error cases.
6. **Describe an implementation path before coding**. Sequence, risks, and **cut lines**.
7. **Keep a “well-ground” template**. Provide a concise story/spec example others can copy.

These steps make the **pitch** sharper, shrink rabbit holes, and produce verifiable **acceptance** tied to quality attributes.

## How it ties back

When you shape and then bet, you are already running _The Mythical Man-Month_ incremental skeleton approach—expressed in **Shape Up** terms—plus TDD, frequent deploys, and a stable staging environment that always works.

## Related Notes

- [[agile|Agile Software Development]]
- [[conways-law-birth-1968|Conway’s Law — origins, literature, and team design]]
- [[DbC|Design by Contract]]
