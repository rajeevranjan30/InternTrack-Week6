# InternTrack Week 5 — Testing Strategy

## Purpose

Week 5 extends the existing InternTrack application with a structured testing strategy covering backend unit tests, frontend helper tests, and the existing API integration suite.

## Existing baseline before Week 5 changes

The existing backend integration suite was run on the student's Windows development environment before Week 5 changes:

- Jest suites: 1 passed
- Tests: 10 passed
- Tests failed: 0
- Execution time: 9.288 s
- API test file: `backend/tests/api.test.js`

This baseline should remain in the final report as the pre-Week-5 comparison point.

## New unit-test coverage

The Week 5 package adds seven test suites in total:

### Backend unit tests

- `backend/tests/unit/authController.test.js`
  - successful registration
  - client-supplied role cannot escalate to admin
  - short password rejection
  - duplicate email rejection
  - invalid login rejection
  - non-string registration field rejection
- `backend/tests/unit/taskController.test.js`
  - owner assignment and field allow-list
  - owner-scoped listing
  - invalid task ID handling
  - empty update rejection
  - missing owner-scoped task handling
- `backend/tests/unit/validate.test.js`
  - valid task payload
  - required fields
  - invalid status/priority/progress/estimated-hours/date
  - status filter validation
- `backend/tests/unit/authMiddleware.test.js`
  - missing token
  - invalid token
  - valid Bearer token
- `backend/tests/unit/token.test.js`
  - JWT payload creation
- `backend/tests/unit/errorHandler.test.js`
  - Mongoose validation errors
  - duplicate-key errors

### Frontend unit tests

`backend/tests/frontend/app.test.js` tests selected browser helpers from `js/app.js`:

- session storage and clearing
- HTML escaping
- progress clamping to 0–100%

The frontend source exports only these selected helpers when running under Node/Jest; normal browser execution is unchanged.

## Running the tests

From the `backend` folder:

```powershell
npm run test:unit
```

This runs the Week 5 unit tests without requiring the application server to be started.

Run the full backend integration suite with:

```powershell
npm test
```

The final submission should use the actual Windows terminal output from these commands as evidence.

## Evidence rule

Do not replace actual test output with manually written numbers. If a test fails, record the failure, fix the underlying issue, rerun the test, and record the successful result.
