---
title: "Web Accessibility V3 — Topics cheat-sheet & decision guide"
date: 2025-09-01
tags:
  - frontend
  - css
  - javascript
description: "Compressed guide to the Web Accessibility (V3) course topics with quick heuristics, team workflow, and checklists."
---

## Summary

- Course map covers **Screen Readers**, **Accessible HTML**, **ARIA**, **Focus Management**, and **Visual Considerations**, plus **Debugging & team process**.
- Aim: ship **perceivable, operable, understandable, robust** experiences (POUR) with practical exercises and team-ready debugging habits.

---

## Topics → what to do (at a glance)

- **Screen Readers:** learn how they work, enable them, write solid **alt text**, and test.
- **Accessible HTML:** prefer **semantic elements** and set **document language**; fix invalid markup.
- **ARIA:** add only when semantics aren’t enough; know **roles, states, properties**, **names/descriptions**, and **live regions**.
- **Focus Management:** full keyboard support, **skip links**, logical **Tab** order, avoid **focus traps**, and review shortcuts.
- **Visual:** check **color contrast**, **reflow/zoom**, **reduced motion**, and **prefers-color-scheme**; connect performance with accessibility.
- **Debugging:** use linters/devtools, improve team workflows, go **beyond compliance**, and practice with hands-on exercises.

---

## Decision heuristics

- **Semantics first → ARIA last.** If a native element already communicates role/state, **don’t add ARIA**.
- **Keyboard is the truth.** If it’s not operable with keyboard and visible focus, it’s not accessible.
- **Name, role, value:** can a screen reader expose them correctly? If not, fix semantics, labels, or ARIA.
- **Respect user prefs:** `prefers-reduced-motion`, `prefers-color-scheme`, and zoom/reflow without loss.

---

## Team workflow

1. **Set standards** (WCAG targets, browser/AT matrix).
2. **Lint & test early** (HTML validity, axe, devtools).
3. **Exercise mindset:** practice with screen readers and keyboard on real UI (modals, forms, navigation).
4. **Go beyond checklists:** optimize usability for assistive technology users, not just box-ticking.

---

## Dev checklist

- [ ] Landmark structure (`header`, `nav`, `main`, `aside`, `footer`).
- [ ] Page language (`<html lang>`).
- [ ] Forms: `<label>` + programmatic names; error text announced.
- [ ] Interactive controls are **native** or fully re-created (role, keyboard, focus, ARIA).
- [ ] Focus order and **visible** focus style.
- [ ] Contrast meets WCAG; no information by color alone.
- [ ] Motion: provide a **reduced motion** path; avoid parallax autoplay by default.
- [ ] Respect zoom/reflow at 200–400% without horizontal scroll.

---

## References

- **Web Accessibility — All Topics (Frontend Masters companion site)**: https://web-accessibility-v3.vercel.app/topics
- **GitHub repo**: https://github.com/marcysutton/frontend-masters-web-accessibility-v3

## Related Notes

- [[react-forwardRef|Forwarding Ref]]
- [[svg-are-the-best|SVG are the Best]]
