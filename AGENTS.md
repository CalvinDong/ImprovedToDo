# Project instructions

## Approval requirement

- Before modifying, creating, moving, renaming, or deleting any file, first present a concise implementation plan.
- Do not make file changes until the user explicitly approves that plan.
- Approval applies only to the proposed scope. Request approval again before making additional changes outside it.
- Read-only inspection and diagnostic commands are allowed before approval.
- Do not install dependencies or run commands that modify project state without explicit approval.

## Working practices

- Preserve unrelated user changes.
- Explain which files would be affected by a proposed change.
- After approved changes, run appropriate checks and report their results.

## Testing principles

For writing tests, write tests that verify externally observable behaviour and business requirements. The purpose of a test is to detect an incorrect implementation—not merely to produce a passing test suite.

Rules:

1. Derive tests from the stated requirements, acceptance criteria, API contract, and expected behaviour before relying on implementation details.

2. Every test must contain a meaningful assertion about:
   - the returned value,
   - resulting state,
   - persisted data,
   - emitted side effect, or
   - expected error.

3. A test is only valuable if a plausible implementation defect would cause it to fail. Before completing a test, identify the specific defect or regression it would detect.

4. Include:
   - the normal successful case,
   - relevant boundary cases,
   - invalid inputs,
   - failure paths,
   - state transitions, and
   - regressions related to the change.

5. Do not:
   - assert only that no exception was thrown,
   - assert constants or values created entirely within the test,
   - reproduce the production algorithm inside the test,
   - mock the subject under test,
   - mock every dependency when a lightweight real implementation is practical,
   - weaken, delete, skip, or broadly rewrite an existing test solely to make it pass,
   - change expected results to match current incorrect behaviour,
   - add branches or special cases to production code that exist only for tests,
