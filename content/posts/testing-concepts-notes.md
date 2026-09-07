---
title: Testing Concepts Notes
date: 2021-01-15
tags:
  - testing
  - react
  - javascript
  - frontend
description: Core testing concepts covering BDD, Sinon, accessibility, Lighthouse, CSS snapshots, unit testing best practices, and Storybook integration with Cypress.
---

## **BDD**

BDD (Behavior Driven Development) is a method of testing where you use "Given" for the scenario, "When" for the environment of the action, and "Then" for the action.

Imagine **AutoLot**, a car dealership chain building an online vehicle marketplace. A product manager, a developer, and a QA engineer sit together and write this scenario in plain English:

```
Given a customer browsing the SUV category
When the customer clicks "Schedule Test Drive" on a 2024 Honda CR-V
Then the test drive request should appear as "pending" in the customer's dashboard
```

This is BDD in practice — the three roles agree on the expected behavior before any code is written. The npm package `jest-cucumber` lets you map these Gherkin-style scenarios directly to Jest tests.

BDD has clear advantages: at AutoLot, new developers joining the team can read the feature files and immediately understand how the test drive booking flow works without digging through implementation code. However, there are trade-offs. Writing and maintaining BDD scenarios for every unit is complex, and a small UI copy change (like renaming "pending" to "awaiting confirmation") can break dozens of scenarios. For this reason, BDD is recommended for E2E testing where the business logic matters most, while `describe` and `it` blocks work better for unit tests.

Reference: [React Behavior Driven Development (BDD)](https://codeburst.io/react-behavior-driven-development-bdd-535afd364e5f)

## **Sinon**

Sinon is a standalone library that provides mock, stub, and spy functions. It works with any test framework (Jest, Mocha, Jasmine).

Consider **AutoLot** migrating their internal tools from Mocha to Jest. Their legacy test suite relies heavily on Sinon for mocking API calls. A spy watches if a function was called and with what arguments; a stub replaces a function with controlled behavior (returning a specific value); a mock is a stub with built-in expectations about how it should be called.

At AutoLot, the team uses a Sinon stub to simulate the financing API returning a "credit declined" response, so they can test the UI error state on the loan calculator without hitting the real credit bureau API. As they migrate to Jest, they gradually replace Sinon stubs with `jest.fn()` and `jest.mock()`, but understanding Sinon's vocabulary (spy, stub, mock) helps them map the concepts 1:1.

Resources:

- [Mocking with Sinon.JS](https://youtu.be/fgqh-OZjpYY)
- [Testing with Stubs in SinonJS](https://youtu.be/TWBDa5dqrl8)

## **Accessibility**

For accessibility testing, you can use the `axe` library in Cypress, in unit testing, and in development. Automated testing catches the low-hanging fruit, but manual testing by a real person is still essential because tools cannot evaluate everything (like keyboard navigation flow or screen reader announcement order).

AutoLot's marketplace needs to be WCAG AA compliant because dealerships serve customers of all abilities, and failing accessibility requirements can also mean legal liability. The team adds `jest-axe` to every component test as a first line of defense:

```javascript
import React from "react";
import { axe } from "jest-axe";
import { render } from "@testing-library/react";
import VehicleCard from "./VehicleCard";

it("should not have basic accessibility issues", async () => {
  const { container } = render(<VehicleCard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

This catches issues like missing `alt` attributes on vehicle images, low contrast ratios on price tags, and missing form labels on the financing calculator — all automatically in CI. But AutoLot also brings in an accessibility consultant quarterly to test with actual screen readers and keyboard-only navigation — things `jest-axe` can't evaluate. They also add `cypress-axe` to their E2E suite to catch issues that only surface when components interact together on a real listing page.

When writing any component test, try querying elements the way a screen reader would (by role, label, or text) rather than by CSS class — this naturally improves both your test quality and your accessibility.

Resources:

- [The Importance of Accessibility Testing](https://youtu.be/dTth-OUkSHk)
- [Accessibility Testing in Practice](https://youtu.be/IADSsClWVtA)

## **Lighthouse**

Lighthouse should not only be used manually in Chrome DevTools — it should also run automatically in the CI/CD pipeline.

At AutoLot, the frontend team noticed their vehicle search results page had become progressively slower over months — customers were bouncing before images even loaded. Nobody caught it because Lighthouse was only run manually, and developers forgot to check. The fix was to add Lighthouse CI to their GitHub Actions pipeline with a threshold: if the performance score drops below 60, the pipeline fails and the PR cannot be merged.

This acts as a guardrail — when a developer accidentally imports a 500KB 3D car viewer library for a small thumbnail hover effect, the CI catches the performance regression before it reaches production. The key insight is that Lighthouse in CI isn't about achieving a perfect score; it's about preventing performance from degrading unnoticed over time.

## **CSS and Responsiveness**

The key approach for visual regression testing is to use Cypress and take snapshots of rendered components, then compare them against baseline images on subsequent runs.

At AutoLot, the team discovered that a CSS refactor silently broke the layout of their vehicle comparison table on tablet screens — customers couldn't see the price column anymore. No unit test caught it because unit tests don't evaluate visual rendering. They introduced Cypress visual snapshots for their critical pages (search results, vehicle detail, and the financing calculator).

However, there's an important caveat: even the same browser on the same OS can produce pixel-level differences due to video card drivers and font rendering. AutoLot learned to configure their snapshot comparisons with a small tolerance threshold (0.1% pixel difference) to avoid flaky tests from anti-aliasing variations.

Reference: [Visual Regression Testing with Cypress](https://youtu.be/Dl_XMd_1F6E)

## **Unit Testing**

For a comprehensive understanding of unit testing philosophy, the following resource is recommended: [Unit Testing Best Practices](https://youtu.be/BzRAYt7BHRw). After watching, read Kent C. Dodds' blog posts on testing best practices to understand the nuances of what to test and what not to test.

At AutoLot, the team was debating how much unit testing to write. A junior developer had written 200 unit tests for the vehicle filter component — testing every internal state change, every CSS class toggle, every re-render. The tests were brittle: any refactor broke dozens of them, even when the actual filtering behavior was unchanged.

Kent C. Dodds' philosophy is: "Write tests. Not too many. Mostly integration." The idea is that integration tests (testing how multiple units work together from the user's perspective) give you more confidence per test than isolated unit tests that verify implementation details.

For testing multiple cases efficiently without duplicating test code, use [jest-in-case](https://github.com/atlassian/jest-in-case) from Atlassian. It lets you define a single test function and run it against an array of different inputs/expected outputs — perfect for testing the loan calculator with different down payments and interest rates.

Another useful resource is the Udemy course [React Testing with Jest and Enzyme](https://www.udemy.com/course/react-testing-with-jest-and-enzyme/learn/lecture/10531816?start=0#overview), which covers foundational concepts like setting state in component tests.

## **Summaries**

Kent C. Dodds emphasizes not becoming overly obsessed with unit testing and focusing more on integration testing, which provides more comprehensive and robust coverage.

Reference: [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)

At AutoLot, the team initially chased 100% code coverage by writing hundreds of shallow unit tests. They realized that many of those tests were testing implementation details (like whether `setState` was called when a user selected a color filter) rather than user-visible behavior. After adopting Kent's philosophy, they reduced their test count by 40% but actually caught more real bugs because each remaining test exercised a meaningful user flow — like searching for an SUV, filtering by price, and clicking "Schedule Test Drive."

It is recommended to avoid accessing a specific node in an array (like `wrapper.find('button').at(2)`) and instead use something stable, such as a `data-testid`. However, `data-testid` should be used sparingly because it doesn't contribute to accessibility — prefer querying by role, label, or text first, and only fall back to `data-testid` when no accessible query is available.

Reference: [Making your UI tests resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change)

Snapshots are useful in specific scenarios:

1. As a quick fix when you need coverage fast
2. When time is limited and only minor changes are expected
3. When dealing with serialized data structures (like Babel AST output)

Otherwise, explicit assertions provide better error messages and are easier to maintain. CSS visual testing through Cypress snapshots is more appropriate than Jest snapshots for layout verification.

Reference: [Effective Snapshot Testing](https://kentcdodds.com/blog/effective-snapshot-testing)

## **BDD Cypress**

Cypress is already set up to support BDD-style tests through the `cucumber-cypress` plugin. Search for "cucumber-cypress" for a straightforward setup guide.

At AutoLot, the QA team writes Gherkin feature files that describe the full car purchase journey — from browsing inventory to submitting a financing application — and the developers implement the step definitions in Cypress. This allows the QA team (who aren't developers) to write and review the test scenarios in plain English while the developers handle the automation.

The BDD techniques and philosophy are well documented at [Automation Panda — BDD](https://automationpanda.com/bdd/).

A critical detail for E2E BDD tests: every test run must start with a clean environment. At AutoLot, this means clearing the test database, seeding it with fixture data (a set of sample vehicles, dealership locations, and test customer accounts), and then running the test. This is maintenance-intensive but essential for reliable results. Using fixtures and only integrating where necessary (rather than resetting the entire database) helps reduce this overhead. This becomes especially important when the test environment depends on an authentication system with its own state.

## **Storybook**

An effective way to test components using Cypress without having to launch the entire application is to use Storybook.

At AutoLot, the design system team has 120+ components — from the `VehicleCard` to the `LoanCalculator` to the `DealershipMap`. Running the full marketplace just to test the `PriceRangeSlider` in isolation would be slow and fragile. Instead, they use Storybook to render each component in isolation, and then point Cypress at the Storybook instance to run interaction and visual tests. Storybook also provides documentation for the design system, and they run `axe` accessibility checks and visual snapshots directly against the Storybook stories.

This approach gives them three things from a single Storybook setup: living documentation, accessibility coverage, and visual regression testing — without ever needing to boot the full application.

Reference: [Testing with Storybook and Cypress](https://www.youtube.com/watch?v=wGWJ4z61ZWQ)

## Related Notes

- [[bdd|BDD]]
- [[tdd-systematic-review-2016|TDD Effects on Quality and Productivity]]
- [[testing-library-vs-enzyme|Testing Library vs Enzyme]]
