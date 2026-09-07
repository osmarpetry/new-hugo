---
title: "TDD Effects on Quality and Productivity"
date: 2025-04-15
tags:
  - testing
  - software-architecture
  - algorithms
description: "Summary of Bissi et al.'s systematic review on Test-Driven Development impacts."
---

## Abstract

Systematic review of 27 empirical studies (1999–2014) on Test-Driven Development (TDD). Evaluates internal code quality, external product quality, and productivity. Findings: TDD generally improves cohesion and reduces coupling; external quality gains are observed in 88% of cases; productivity results vary, showing improvements in academic settings but a decrease in industrial environments.

## Key points

- **Internal quality:** Improves in 76% of evaluated cases, showing lower coupling, reduced cyclomatic complexity, and higher cohesion (often measured via CK Metrics).
- **External quality:** Positive impact in 88% of the scenarios, with significant defect reduction in critical systems.
- **Productivity:** Mixed outcomes. Academic environments reported speed gains, while industrial settings reported a productivity dip.
- **Moderators:** Prior unit testing experience and continuous integration adoption amplify benefits.
- **Limitations:** Selection bias, uncontrolled environmental variables, self-reported productivity metrics.

## Connections

- Aligns with Clean Code principles and CK metrics usage.
- Supports discussions on technical debt in agile processes.
- Contrasts with test-last approaches in rapid prototyping.
- Relates to research on developer psychology and TDD adoption.

## Questions

- How to tailor TDD for volatile requirements?
- What is the maintenance cost of large test suites over time?
- Are metrics like branch coverage sufficient to gauge TDD effectiveness?
- How does TDD coexist with generative AI in testing workflows?

## Personal reflections

- TDD excels for complex business logic; less so for simple CRUD modules.
- CK metrics help quantify internal quality gains.
- Variability explains why some companies abandon TDD after superficial adoption.
- Integrating TDD with BDD could boost external quality.

## Detailed notes

- **Methodology:** PRISMA-based review of 27 empirical studies.
- **Variables:** Internal quality (CBO, LCOM, WMC, RFC), external quality (defects, MTBF, user satisfaction), productivity (delivery speed, cognitive effort).
- **Results:** 76% of cases showed increased internal quality (coupling reduction, ~20% cohesion increase, lower cyclomatic complexity); 88% showed increased external quality (defect reduction); proficiency reached after initial productivity dip, mostly observed in academic scenarios.
- **Limitations:** Many studies lacked controls for prior testing expertise; productivity data often self-reported; publication bias toward positive outcomes.

## Example in Go

```go
package cpf

import "testing"

func TestCPFRejectsAllZero(t *testing.T) {
	if IsValid("00000000000") {
		t.Error("All-zero CPF should be invalid")
	}
}

func TestCPFValidKnownValue(t *testing.T) {
	if !IsValid("52998224725") {
		t.Error("Valid CPF was rejected")
	}
}

func IsValid(cpf string) bool {
	if len(cpf) != 11 {
		return false
	}
	for i := 1; i < len(cpf); i++ {
		if cpf[i] != cpf {
			return true // Simplified logic for example
		}
	}
	return false
}
```

## References

- Bissi, W., Seca Neto, A. G. S., & Emer, M. C. F. P. (2016). The effects of test driven development on internal quality, external quality and productivity: A systematic review. _Information and Software Technology_. [https://www.sciencedirect.com/science/article/abs/pii/S0950584916300222](https://www.sciencedirect.com/science/article/abs/pii/S0950584916300222)
- Additional supporting documents (ResearchGate, CK Metrics literature).

## Related Notes

- [Gophers Workshop — Deploy-First Go Architecture](agenda-gophers-workshop)
- [Design & Analysis of Algorithms — Course Overview](algorithms-course-intro)
- [Assembly Study Plan](assembly-study-plan)
- [BDD](bdd.md)
- [Code Smells and Maintainability](code-smells-impact-maintainability)
- [Enterprise UI Development — Testing, Standards, and Ego Control](enterprise-ui-development)
- [Testing Concepts Notes](testing-concepts-notes.md)
