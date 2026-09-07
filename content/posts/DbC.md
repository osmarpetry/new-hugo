---
title: Design by Contract (DbC)
date: 2025-04-15
tags:
  - software-architecture
  - project-management
description: Summary of Bertrand Meyer’s Design by Contract principles for robust software.
---

## Abstract

Bertrand Meyer introduced Design by Contract (DbC) to formalise expectations between software components. Contracts specify obligations and benefits for clients and suppliers via preconditions, postconditions, and invariants, enabling safer, more maintainable systems.

## Key points

- **Contracts**: Define preconditions (caller responsibilities), postconditions (supplier guarantees), invariants (state consistency).
- **Runtime checks**: Contracts can be enforced during development/testing to catch violations early.
- **Documentation**: Contracts serve as precise specs and executable documentation.
- **Encapsulation**: Components hide implementation details while exposing contractual behaviour.
- **Reuse & reliability**: DbC encourages reusable components with clear expectations.

## Connections

- Basis for Eiffel language features; influences modern assertion frameworks.
- Complements unit testing and TDD by clarifying expected behaviour.
- Aligns with API design best practices and microservice contracts.

## Questions

- How to balance DbC runtime checks with performance constraints?
- How to integrate DbC in languages without native support?
- When should contracts be relaxed or extended as systems evolve?

## Personal reflections

- Contracts clarify team communication and reduce misunderstandings.
- Useful for critical systems where correctness outweighs overhead.
- Combining DbC with automated tests and CI improves confidence in deployments.

## References

- Meyer, B. (1992). _Applying "Design by Contract"_. Computer, 25(10), 40-51.
- Official Eiffel documentation on DbC.

## Related Notes

- [[conways-law-birth-1968|Conway’s Law — origins, literature, and team design]]
- [[design-patterns|Design Pattern]]
- [[ddd|Domain-Driven Design: Tackling Complexity in the Heart of Software]]
- [[no-silver-bullet-1986|No Silver Bullet — Essence & Accidents]]
- [[parnas-modularization-1972|Modularization Criteria — Parnas 1972]]
- [[shape-up-2020|Shape Up: Stop Running in Circles and Ship Work that Matters]]
- [[software-aging-1994|Software Aging]]
