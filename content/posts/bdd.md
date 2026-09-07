---
title: "Behavior-Driven Development (BDD)"
date: 2025-01-15
tags:
  - testing
  - bdd
  - cucumber
description: "BDD with Cucumber and Gherkin — principles, syntax reference, step definitions in JS/TS, best practices, and comparison with TDD."
---

## What Is BDD

BDD bridges the gap between business stakeholders and developers by expressing requirements as executable specifications. Instead of writing tests after the fact, you describe the **expected behavior** of the system in plain language, then automate those descriptions.

The core loop: **Discovery** (what should the system do?) → **Formulation** (write it in Gherkin) → **Automation** (implement step definitions).

## BDD vs TDD

TDD focuses on unit-level correctness ("does this function return the right value?"). BDD focuses on system-level behavior ("does this feature work from the user's perspective?"). In practice they complement each other — use TDD for internal logic, BDD for acceptance and integration tests.

## Cucumber

Cucumber is the most widely adopted BDD framework. It reads `.feature` files written in Gherkin and executes matching step definitions.

**Supported languages:** Java, JavaScript/TypeScript (`cucumber-js`), Ruby, Python (`behave`), Kotlin, .NET (`SpecFlow`), Go (`godog`).

### Installing cucumber-js

```bash
npm install --save-dev @cucumber/cucumber
```

For TypeScript, add `tsx` for just-in-time transpilation:

```bash
npm install --save-dev @cucumber/cucumber tsx
```

In `cucumber.js` config:

```javascript
module.exports = {
  default: {
    requireModule: ["tsx"],
    require: ["features/step_definitions/**/*.ts"],
    format: ["progress", "html:reports/cucumber.html"],
  },
};
```

## Gherkin Syntax Reference

Gherkin uses keywords to structure specifications. Each `.feature` file describes one feature with one or more scenarios.

### Keywords

| Keyword            | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `Feature`          | Top-level description of a feature                  |
| `Rule`             | Groups scenarios under a business rule (Gherkin 6+) |
| `Scenario`         | A single concrete example of behavior               |
| `Given`            | Precondition — set the context                      |
| `When`             | Action — the event being tested                     |
| `Then`             | Outcome — the expected result                       |
| `And` / `But`      | Continue the previous step type                     |
| `Background`       | Steps shared by all scenarios in a feature          |
| `Scenario Outline` | Template with variable examples                     |
| `Examples`         | Data table for Scenario Outline                     |

### Feature File Example

```gherkin
Feature: User authentication

  Background:
    Given the user is on the login page

  Scenario: Successful login
    When the user enters valid credentials
    Then the user is redirected to the dashboard
    And a welcome message is displayed

  Scenario: Invalid password
    When the user enters an invalid password
    Then an error message "Invalid credentials" is shown
    And the user remains on the login page
```

### Scenario Outline with Examples

```gherkin
Feature: Shopping cart pricing

  Scenario Outline: Discount tiers
    Given a cart with <quantity> items at $<price> each
    When the checkout total is calculated
    Then the discount should be <discount>%
    And the total should be $<total>

    Examples:
      | quantity | price | discount | total  |
      | 1        | 10.00 | 0        | 10.00  |
      | 5        | 10.00 | 10       | 45.00  |
      | 10       | 10.00 | 20       | 80.00  |
```

### Data Tables and Doc Strings

```gherkin
Scenario: Register multiple users
  Given the following users exist:
    | name    | email             | role    |
    | Alice   | alice@example.com | admin   |
    | Bob     | bob@example.com   | viewer  |

Scenario: Submit a JSON payload
  When the client sends a POST to "/api/data" with body:
    """json
    {
      "name": "test",
      "value": 42
    }
    """
  Then the response status is 201
```

### Tags

Tags filter which scenarios run. Prefix with `@`:

```gherkin
@smoke @auth
Feature: Authentication

  @automated
  Scenario: Login with SSO
    ...

  @manual @wip
  Scenario: Login with biometrics
    ...
```

Run only automated smoke tests:

```bash
npx cucumber-js --tags "@smoke and @automated"
```

## Step Definitions (TypeScript)

```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";

Given("the user is on the login page", async function () {
  await this.page.goto("/login");
});

When("the user enters valid credentials", async function () {
  await this.page.fill("#email", "user@test.com");
  await this.page.fill("#password", "secret");
  await this.page.click('button[type="submit"]');
});

Then("the user is redirected to the dashboard", async function () {
  expect(this.page.url()).to.include("/dashboard");
});

Then("an error message {string} is shown", async function (message: string) {
  const alert = await this.page.textContent(".alert-error");
  expect(alert).to.equal(message);
});
```

## Best Practices

**Write declarative, not imperative.** Describe _what_ the user does, not _how_ they interact with the UI. Bad: "When the user clicks the #login-btn element." Good: "When the user logs in."

**One When-Then pair per scenario.** Multiple When-Then blocks signal that the scenario covers too many behaviors. Split it.

**Keep steps reusable.** Avoid conjunctive steps ("Given the user is logged in and has items in cart"). Break into two steps — each one becomes reusable across scenarios.

**Use Background sparingly.** Only for Given steps shared by every scenario in the feature. If only some scenarios need it, duplicate the Given or split into separate features.

**Verify observable outcomes.** Then steps should check what the user (or an external system) can see — not internal state like database rows.

**Tag strategy.** Use `@automated`, `@manual`, `@wip` to manage test execution. In CI, run `--tags "not @manual and not @wip"`.

**Three Amigos.** Before writing Gherkin, hold a brief session with a developer, tester, and product person to agree on scenarios. This is where BDD delivers the most value — shared understanding before code.

## When to Use BDD (and When Not To)

**Use BDD for:** API acceptance tests, UI integration tests, cross-team specifications, user-facing features, regression suites.

**Skip BDD for:** unit tests (use TDD directly), performance benchmarks, one-off scripts, purely technical refactors.

## Related Notes

- [[tdd-systematic-review-2016|TDD Effects on Quality and Productivity]]
- [[testing-concepts-notes|Testing Concepts Notes]]
- [[testing-library-vs-enzyme|Testing Library vs Enzyme]]
