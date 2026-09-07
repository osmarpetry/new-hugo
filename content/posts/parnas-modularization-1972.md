---
title: "Modularization Criteria — Parnas 1972"
date: 2025-04-15
tags:
  - software-architecture
  - backend
description: "Summary of David Parnas’s criteria for decomposing systems into modules (KWIC case study)."
---

## Abstract

David L. Parnas (1972) proposed information hiding as the primary criterion for modular design, using the KWIC (Key Word In Context) system to compare traditional flow-based modularization vs encapsulating design decisions. His approach yields systems that are easier to modify, maintain, and evolve.

## Key points

- Traditional modularization (aligned with processing steps) leads to high coupling and brittle systems.
- Information hiding: modules encapsulate design decisions (data structures, algorithms, storage formats).
- KWIC case study: conventional design (5 modules aligned with processing sequence) vs information-hiding design (4 modules for storage, circular shift generation, sorting, output).
- Benefits: localized changes, clear responsibilities, replaceable internals without breaking clients.
- Trade-off: potential performance overhead due to inter-module communication; can be mitigated via inlining and efficient call mechanisms.

## Connections

- Precursor to object-oriented encapsulation and modern modular design.
- Supports microservices and DDD bounded context thinking.
- Relates to clean architecture and low coupling principles.
- Anticipates interface contracts in modern API design.

## Questions

- How to apply information hiding in fast-paced agile projects?
- Which metrics can quantify effective information hiding?
- How to balance encapsulation with performance in real-time systems?
- Applicability to distributed architectures?

## Personal reflections

- Encapsulating design decisions prevents leakage of implementation details across layers.
- KWIC example illustrates how storage strategies can remain swappable with proper abstraction.
- Critique of flow-based modularization still relevant for ETL/data pipeline architectures.
- Stable interfaces support DevOps pipelines and isolate testing concerns.

## References

- Parnas, D. L. (1972). _On the Criteria To Be Used in Decomposing Systems into Modules_. Communications of the ACM, 15(12), 1053-1058.
- Modern commentary: [https://www.refact0r.dev/blog/module-criteria](https://www.refact0r.dev/blog/module-criteria)

## Related Notes

- [[conways-law-birth-1968|Conway’s Law — origins, literature, and team design]]
- [[DbC|Design by Contract]]
- [[no-silver-bullet-1986|No Silver Bullet — Essence & Accidents]]
- [[software-aging-1994|Software Aging]]
