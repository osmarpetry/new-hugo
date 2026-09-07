---
title: "Conway’s Law — origins, literature, and team design"
date: 2025-04-15
tags:
  - software-architecture
  - project-management
  - resources
description: "Summary of Melvin Conway’s original essay, subsequent research, and practical implications for structuring engineering teams."
---

## Reference stack

- Melvin Conway, “How Do Committees Invent?” (1968).
- Thoughtworks, “Applying Conway’s Law to Improve Your Software Development.”
- M. Soldani et al., “A Decade of Conway’s Law: A Literature Review 2003–2012” (IEEE).
- Video summary: [https://youtu.be/SWrlFod8t5g](https://youtu.be/SWrlFod8t5g).

## Essence of the law

> “Any organization that designs a system will produce a design whose structure is a copy of the organization’s communication structure.”

- Architecture mirrors team communication pathways; siloed teams create siloed modules, joined at fragile seams.
- “Monolithic teams do not build microservices”—system modularity depends on cross-team autonomy and shared vocabulary.
- Neglecting communication design results in accidental system design, rather than deliberate architecture.

## Historical context & popularization

- Conway observed the phenomenon across software, military, and governmental projects in the 1960s.
- Frederick Brooks amplified the idea in _The Mythical Man-Month_, cementing “Conway’s Law” in software folklore.
- Later research confirms that org charts and interface diagrams often align, sometimes unintentionally.

## Key takeaways from the literature review

- Larger organizations introduce communication friction, leading to complex, tightly coupled systems.
- Parkinson’s Law: management layers tend to expand, exacerbating coordination overhead.
- Small, autonomous teams (“two-pizza teams”) correlate with cleaner, more modular architecture.

## Review questions

1. How does organizational structure influence the resulting system design?

- Systems reflect the communication patterns of their creators; poor cross-team collaboration manifests as brittle interfaces.

2. How does company size impact system complexity?

- As organizations grow, coordination paths lengthen, producing sprawling systems with integration pain; keeping teams small mitigates the effect.

## Practical implications

- Design teams around the architecture you want (the “inverse Conway maneuver”): align squads to bounded contexts before writing code.
- Optimize for communication density: co-locate domains, create shared rituals, and collapse unnecessary hierarchy.
- When introducing API gateways or platform teams, ensure their communication network matches the required integrations.
- Regularly map org structures to architecture diagrams; adjust teams when misalignment appears.

## Next actions

- Compare current team topology with service/module boundaries; plan reorg if misalignment exists.
- Share the original essay and Thoughtworks article with engineering leadership to ground discussions in historical context.
- Incorporate Conway’s Law checkpoints into architecture reviews (e.g., “Does a team own each interface?”).

## Related Notes

- [[DbC|Design by Contract]]
- [[no-silver-bullet-1986|No Silver Bullet — Essence & Accidents]]
- [[parnas-modularization-1972|Modularization Criteria — Parnas 1972]]
- [[software-aging-1994|Software Aging]]
