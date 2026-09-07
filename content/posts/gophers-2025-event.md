---
title: "Gophers 2025 — Event Report"
date: 2025-05-20
tags:
  - golang
  - kubernetes
  - observability
description: "Comprehensive recap of the Gophers 2025 conference (13–14 May) including sessions, workshops, detailed technical notes, and recommended next steps for Go teams."
---

## Introduction

Gophers 2025 brought the Go community together in Anita Garibaldi, Santa Catarina, for two full days of talks, panels, and hands-on workshops. Sessions ranged from organizational culture and dependency-injection strategies to Kubernetes tuning, automation, game development with Ebiten, and end-to-end observability. This report consolidates every note found in the `Gophers 2025/` directory into a single English-language document. It follows the event chronologically and highlights technical takeaways, workshop content, a real-world case study, and concrete action items.

## Day 1 — 13 May 2025

### Opening Keynote: Go vs. Traditional Corporate Structures

- Go’s simplicity pushes organizations to evolve their engineering culture.
- Themes: clarity over cleverness, willingness to experiment, and a pragmatic approach to tooling.
- Quote: “Go is simple, but your engineering culture must change to truly benefit from it.”

### Dependency Injection in Go (Manual, Wire, Dig, FX)

- **Manual DI** remains the baseline—explicit constructors keep code readable and testable.
- **Wire** (Google): statically generated wiring, low runtime overhead, and improved traceability; recommended when the dependency graph is stable and performance matters.
- **Dig/FX** (Uber): reflection-based DI with lifecycle hooks, modules, and background jobs; powerful for dynamic systems but requires comfort with reflection.
- Suggested decision matrix:

1.  **System complexity:** small systems → manual or Wire.
2.  **Hot-swappable modules:** Dig/FX shine when plugins and runtime configuration are essential.
3.  **Observability requirements:** manual/Wire offer transparent graphs; Dig/FX benefit from extra logging and instrumentation.

- Workshop recap: practical demo wiring a bookstore application with all three libraries; best practices include terminating background jobs when the app shuts down.

### Advanced Error Handling

- Reinforced Go’s mantra: “errors are values.”
- Recommendations: prefer sentinel errors for predictable flows, enrich errors with context (`fmt.Errorf("... %w", err)`), and propagate `context.Context` boundaries explicitly for distributed tracing.

### Automation & Testing via SSH

- Case studies showed running test suites via SSH to environments locked down for security or isolation.
- Key message: coverage percentages matter less than the confidence and repeatability provided by automation.

### AI with Go

- While Python dominates experimental ML, Go excels at production pipelines and inference services.
- Tooling: TensorFlow/ONNX bindings, ability to embed Python/JS models, but fewer off-the-shelf libraries for research-grade experimentation.

### Panel — Brazilian Companies in Production (Globo, Stone, Unico, Nubank)

- Discussed migration stories, tooling, and the human side of adoption.
- Nubank highlighted Kubernetes automation scripts written in Go, focusing on idempotency and RBAC-compliant operations.

### Memory Leak Diagnostics in Go

- Even with a garbage collector you can leak memory by holding references or leaking goroutines.
- Tools demonstrated: `pprof`, `go tool trace`, runtime metrics, and monitoring goroutine counts.

## Day 2 — 14 May 2025

### Bill Kennedy — “K8s CPU Limits Deconstructed for Go Software”

- Context switches on Linux cost roughly 12k instructions; aggressive CPU limits throttle the Go runtime.
- Actionable advice: align `GOMAXPROCS` with the container’s CPU quota, and understand that IO-bound workloads may behave as CPU-bound under constrained quotas.
- Demonstrated measuring throughput improvement by tuning CPU limits and runtime settings.

### Behind the Scenes: Testing Kubernetes (Amim Knabben)

- Walkthrough using `kind` for local clusters, coupled with GitHub Actions.
- Strategies: focus on confidence (integration tests, e2e) instead of chasing 100% coverage; automate smoke tests for cluster add-ons.

### Workshop: Building Pac-Man with Ebiten (Carlos Gandarez)

- Full game loop: sprite sheets, collision detection, tile maps, ghost AI, and state machines.
- Highlights: using graph-based pathfinding for ghosts, structuring an ECS-like architecture in Go, and hot-reload workflows for assets.

### Goroutines in Containers (Bianca Rosa)

- Compared different concurrency patterns (`sync.WaitGroup`, channels, `errgroup`).
- Operational tips: track goroutines within containers (`ps aux`, `killall`), monitor CPU throttling, and configure shell aliases to inspect runtime stats quickly.

### “Gopherizing Everyday Life” (Vinícius Bosoardin)

- Showed small Go services integrating Alexa routines, web scraping, and home automation.
- Emphasized modular architecture and small, reusable libraries.

### International Panel (XP Inc, Ardan Labs, MercadoLivre)

- Discussed cultural adoption, distributed teams, scaling Go engineering across regions, and bridging time zones.
- Key takeaway: invest in interface contracts, shared observability, and documentation to align globally distributed teams.

### Garbage Collection Deep Dive (Maximiliano Furtado)

- Techniques to reduce stop-the-world pauses (STW): avoid unnecessary heap allocations, prefer stack allocation, profile with `pprof`, and review escape analysis.
- Real case studies indicated significant latency improvements by removing temporary structures.

### Instrumentation with OpenTelemetry (Juraci Paixão)

- Step-by-step instrumentation of Go microservices, exporting traces, metrics, and logs.
- Reminder: adopt W3C trace context headers to ensure cross-service compatibility, and propagate context conscientiously.

## Workshops — Consolidated Notes

### Workshop: Go Software Design (Bill Kennedy)

- **Package Oriented Design (POD):** packages act as firewalls; erroneous dependencies are compilation failures, echoing early C concerns about isolation.
- **Architecture Layers:** App (protocols/external interfaces), Business (domain logic), Storage (persistence). Lower layers should not import higher layers.
- **Trust Models:** move from “no trust” (every layer revalidates) to “trust but verify” (types enforce constraints, minimal runtime checks).
- **Domain-Driven, Data-Oriented Design (DDDOD):** vertical slicing along domains, similar to microservices but without network overhead.
- **Strong typing:** avoid “gorillas” (oversized parameter structs); prefer strong domain types over primitives to catch errors at compile time.
- **Value vs Pointer semantics:** choose semantics deliberately—small structs with value semantics, APIs with pointer receivers, slices copied by value but backed by shared arrays.
- **Deploy-first mindset:** aim for Day 0 automation so Day 1 includes production deployment readiness; prevents the “eight months to doom” scenario.
- **Game of trade-offs:** focus on data semantics, gorilla-safe APIs, cognitive load, and refactoring workflows.

### Workshop Corrections & Additional Insights

- Compared arrays vs slices (arrays: fixed size, value semantics; slices: descriptors pointing to arrays).
- Reinforced the importance of eliminating speculative abstractions; avoid `utils/` or `common/` packages that become dependency abysses.
- Highlighted “cognitive weight”: refactor mental models to reduce load; rely on tools (including LLMs) to explore unfamiliar namespaces, but ground code in readability.
- Observed that high-performing projects refactor relentlessly, aiming for ease of understanding, not just ease of writing.
- Encouraged daily breaks, structured journaling, and capturing “What does DONE mean?” across stakeholders to align expectations.

## Case Study — Abstract Template for DynamoDB

**Context**: A project needed to serialize Go structs to DynamoDB flexibly, supporting varying JSON formats while decoupling from the driver.

**Problem**: Hand-written conversion logic was verbose, error-prone, and scattered. Error handling and mapping dynamic structs with tags made maintenance difficult.

**Approach**:

- Extracted a generic template in `db.go` to handle JSON serialization/deserialization for any struct, respecting tags.
- Centralized error handling and conversions so the business layer could focus on domain logic.
- Introduced interfaces to abstract persistence while retaining portability and testability.

**Outcome**:

- Adding new entities required only defining structs and tags; CRUD boilerplate disappeared.
- Error handling became consistent, reducing operational incidents.
- The solution exemplified “firewalls” in practice—one module encapsulating persistence logic, letting other layers trust its behavior.

**Quotes & References**: “The main win was standardization and fewer operational mistakes, plus a smoother path for automated tests and CI.”

## Key Takeaways

1. **Culture before tooling**: the simplicity of Go demands disciplined engineering practices.
2. **Dependency injection is context-dependent**: start with manual or Wire; adopt Dig/FX only when needed.
3. **Performance observability matters**: tune `GOMAXPROCS`, watch goroutines, and profile continuously.
4. **Testing for confidence**: focus on automation that protects critical flows rather than chasing coverage metrics.
5. **Observability as a first-class citizen**: instrument your services early with OpenTelemetry.
6. **Broadened Go ecosystem**: Ebiten game dev, home automation, and AI pipelines illustrate Go’s range beyond REST services.

## Action Items

- Build a dependency-injection decision matrix (manual vs Wire vs Dig/FX) and document it for project onboarding.
- Audit Kubernetes deployments to align CPU/resource quotas with runtime settings, and add `pprof` endpoints to critical services.
- Prototype the Ebiten Pac-Man example internally to experiment with Go-based UI layers.
- Review existing APIs for “gorilla parameters”; refactor to stronger domain types.
- Instrument services with OpenTelemetry and ensure trace propagation across boundaries.

## References

- Bill Kennedy — “K8s CPU Limits Deconstructed for Go Software” (Gophers 2025)
- Bianca Rosa — “Goroutines in Containers”
- Juraci Paixão — “Instrumentation with OpenTelemetry”
- Vinícius Bosoardin — “Gopherizing Everyday Life”
- Carlos Gandarez — “How to Build a Game in Go Using Ebiten”
- Amim Knabben — “Exploring the Kubernetes Test Suite”
- Ardan Labs — Domain-Driven, Data-Oriented Design workshop materials
- Official Go docs: [https://go.dev/doc/](https://go.dev/doc/)
- OpenTelemetry for Go: [https://opentelemetry.io/docs/instrumentation/go/](https://opentelemetry.io/docs/instrumentation/go/)

## Related Notes

- [[dddod|Domain-Driven, Data-Oriented Design (DDDOD)]]
