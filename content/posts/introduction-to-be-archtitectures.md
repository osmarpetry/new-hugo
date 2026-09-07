---
title: "Backend Architectures — history, case studies & dogfooding"
date: 2025-09-01
tags:
  - backend
  - project-management
  - devops
description: "From monolith → services → serverless; lessons from Amazon, Netflix, Google, Uber; how dogfooding turns platforms into products."
---

## Summary

- Know the **history** (monolith → services → serverless) to choose the **right shape for now**.
- Use **dogfooding** to turn internal capabilities into **platforms** and eventually **products**.
- Pair **tech + finance** on every decision so architecture choices have a clear **P&L story**.

---

## Case studies (what they did → why it mattered)

- **Amazon**: built infra & tooling for itself first (**dogfood**) → later externalized as **AWS** (new revenue, 2× monetization of the same effort).
- **Netflix**: **hybrid** of microservices + serverless; serverless for bursty/edge workloads, services for core domains → **speed + cost control**.
- **Google**: evolved from large coordinated monoliths to **microservices** as scale/teams grew → **independent deploys** and **targeted reliability**.
- **Uber**: reused **profile, payments, geo, notifications** to launch **Eats** quickly → **time-to-market** by reusing platform primitives.

---

## Decision heuristics (when to pick what)

- **Monolith first** when the team is small, domain still moving, and you need **velocity**.
- **Split by domain** (bounded contexts) when teams block each other and deploys become risky.
- **Serverless** for event-driven, spiky, or edge tasks where **operational burden** must be minimal.
- Always design for **observability** (logs/metrics/traces) and **clear failure domains**.

---

## Dogfooding → productization loop

1. **Build** the capability you need (internal API/service).
2. **Harden** with SLOs, docs, dashboards.
3. **Reuse** across 2–3 internal products (prove generality).
4. **Abstract** contracts (versioning, quotas, cost model).
5. **Externalize** (SDKs, billing, support) when economics are clear.

**Two-sided payoff:** internal reuse lowers **cost/time**, externalization creates **revenue**.

---

## Platform checklist (reuse before you rebuild)

- Identity & auth
- Profiles & permissions
- Payments & billing
- Geo (maps, routing, distance, areas)
- Messaging/notifications
- Media (upload, encode, CDN)
- Catalog & search
- Orders & fulfillment
- Analytics & experimentation

> If an “Eats-like” spin-off is on the roadmap, ensure these boxes are reusable and observable.

---

## Tech × Finance alignment

- For every architecture choice, capture: **CapEx/OpEx**, **unit cost per txn**, **time-to-ship**, **risk/SLO impact**.
- Define a **shut-off** rule: if a new service can’t prove >_X_% cost or lead-time improvement in _Y_ weeks, **stop or merge back**.

---

## Actions (my context)

- Map current ATTEN capabilities to the **Platform checklist** above.
- Identify 3 candidates we can **productize** internally in the next quarter (auth, payments, geo).
- Draft SLOs + cost model per candidate; run one **dogfood pilot** across two teams.

---

## References

- Course: **Introduction to Backend Architectures** — modules on Amazon/Netflix/Google/Uber.

## Related Notes

- [[conways-law-birth-1968|Conway’s Law — origins, literature, and team design]]
