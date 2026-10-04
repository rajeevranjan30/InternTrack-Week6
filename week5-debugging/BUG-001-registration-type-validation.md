# Week 5 Debugging Record — BUG-001

## Bug

The registration controller checked whether `name`, `email`, and `password` were present, but it did not verify that they were strings before calling string methods such as `.toLowerCase()` and `.trim()`.

A malformed API request such as a numeric `name` could therefore bypass the initial presence check and cause a runtime TypeError instead of a controlled client-validation response.

## Reproduction

The new unit test sends:

```json
{
  "name": 123,
  "email": "alex@example.com",
  "password": "password123"
}
```

Expected behavior: HTTP 400 with a clear validation message.

### Before the fix

The regression test was executed against the original implementation and failed:

- Test suites: 1 failed
- Tests: 4 passed, 1 failed
- Failure: expected `res.status(400)` but the response status was never called

This confirms that the original implementation did not handle the malformed type as a normal validation error.

## Root cause

The controller performed presence validation before type validation. JavaScript values other than strings could therefore reach `.toLowerCase()`, `.trim()`, or password handling.

## Fix

The registration controller now explicitly requires `name`, `email`, and `password` to be strings before using string-specific operations.

## Verification after the fix

The regression test now passes. The prepared Week 5 unit suite currently reports:

- 7 test suites passed
- 28 tests passed
- 0 tests failed

The final Windows result should be captured with `npm run test:unit` and used as the submission evidence.
