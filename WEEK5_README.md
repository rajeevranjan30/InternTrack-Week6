# InternTrack — Week 5 Testing, Debugging & Optimization

## Scope

This Week 5 work builds on the existing Week 4 full-stack InternTrack application rather than creating a new application.

### Main areas

1. Backend unit testing with Jest.
2. Frontend helper unit testing with Jest.
3. Existing backend API integration testing with Supertest.
4. Reproduction and correction of a real registration input-validation defect.
5. Measurement-based query optimization for task listing.
6. Documentation of test strategy, debugging, and optimization evidence.

## Important commands

From `backend`:

```powershell
npm run test:unit
npm test
```

From the project root:

```powershell
node week5-optimization/benchmark.js
```

## Baseline

Before Week 5 changes, the student's existing integration suite produced 10 passed tests in 9.288 seconds. The final full-suite result must be rerun after the Week 5 changes.

## New coverage

The prepared package contains 7 Week 5 unit/frontend suites and 28 unit/frontend assertions/tests. The final count should be confirmed from the student's local `npm run test:unit` output.

## Debugging

See `week5-debugging/BUG-001-registration-type-validation.md`.

## Optimization

See `week5-optimization/OPTIMIZATION-001-lean-query.md` and run the benchmark before recording any final performance numbers.

## Submission safety

Do not include `backend/.env` or `backend/node_modules` in the final submission ZIP. Include `.env.example` and source/test files instead.
