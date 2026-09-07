---
title: "Package Oriented Design"
date: 2025-05-12
tags:
  - golang
  - software-architecture
description: "Bill Kennedy’s approach to Go package design: purpose-driven packages, clear boundaries, and modular structure."
---

## Summary

Bill Kennedy’s Package Oriented Design (POD) emphasises starting and ending architectural decisions at the package level. Each package should provide a focused solution for a domain problem to keep code composable, testable, and maintainable.

## Definition

POD identifies where each package belongs and the design rules it follows. Packages act as the building blocks of Go applications, supporting composition and isolation.

## Guiding philosophy

- **Purpose over storage:** packages should provide behaviour, not just hold utilities.
- **Encapsulation:** expose only necessary APIs and hide implementation details.
- **Portability:** a consistent package structure makes discussion and reuse easier across projects.
- **Layering:** organise code into purposeful layers, such as `kit`, `application`, and `service`, with explicit interaction rules.

## Benefits

- **Modularity:** domain-specific packages reduce unwanted coupling.
- **Maintainability:** clear responsibilities make testing and refactoring easier.
- **Scalability:** well-defined package boundaries support growth in complexity and team size.

## Package responsibilities

- Live in one place per domain, such as `internal/user` or `internal/platform`.
- Provide a specific solution and avoid generic buckets like `common` or `util`.
- Export only the API needed by consumers and keep implementation details private.
- Name files to reflect behaviour so callers understand what the package delivers.

## Layering cheat-sheet

### `kit`

Shared libraries with zero dependency on application packages.

### `application`

Domain and business logic that depends on `kit`.

### `service`

Entrypoints such as `cmd/...` that compose everything and wire external systems. This layer can depend on both `kit` and `application`.

## Example structure

- A `kit` project for shared libraries.
- Multiple `application` projects depending on `kit`, organised by business domain.
- A `service` layer, such as `cmd/api`, wiring repositories, services, and handlers according to POD rules.

## References

- Bill Kennedy, _Package-Oriented Design_ — Ardan Labs blog and talks.
- Ardan Labs Service repository as a POD example.

## Related Notes

- Gophers Workshop — Deploy-First Go Architecture
- Backward Design for Learning
- Books & Papers to Study
- Domain-Driven, Data-Oriented Design (DDDOD)
- Golang
- Software Architecture Overview
