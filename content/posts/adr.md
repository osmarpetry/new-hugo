---
title: "ADR — Architecture Decision Records"
date: 2025-01-15
tags:
  - software-architecture
  - project-management
  - workflow
description: "How to use Architecture Decision Records (ADRs) to document important architectural choices, their context, and trade-offs."
---

ADRs (Architecture Decision Records) are essential documents in software engineering that capture important architectural choices and the context behind them. In an Obsidian vault, ADRs integrate naturally into project documentation.

## Why use ADRs?

In long-running projects — such as framework migrations or service changes in Go or Java — decisions change constantly. Without recording _why_ a tool was chosen over another, the team (or even yourself) may forget the reasoning months later, losing the context that justified the choice.

## Basic ADR structure

1. **Context / Problem:** What were we trying to solve?
2. **Options Considered:** Which alternatives were evaluated (e.g., Goroutines vs BullMQ)?
3. **Decision:** What was chosen and why?
4. **Consequences:** What are the trade-offs (e.g., we gained resilience but increased infrastructure complexity)?

## Where do ADRs live?

While a project is active, its ADRs live inside the project folder. When the project ends, the ADRs follow the project into `ARCHIVE`, preserving the full history of the system.

## Related Notes

- [[design-patterns|Design Patterns]]
- [[ddd|Domain-Driven Design]]
- [[shape-up-2020|Shape Up]]
