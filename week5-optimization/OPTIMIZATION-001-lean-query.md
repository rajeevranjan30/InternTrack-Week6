# Week 5 Optimization Record — OPT-001

## Target

Task-list retrieval in `backend/src/controllers/taskController.js`.

## Observation

The list endpoint returns task data for display only. The controller does not modify or save the returned Mongoose documents.

## Optimization

The query now uses Mongoose `.lean()`:

```js
const tasks = await Task.find(filter)
  .sort({ dueDate: 1, createdAt: -1 })
  .lean();
```

`lean()` returns plain JavaScript objects and avoids Mongoose document hydration for a read-only response.

## Correctness protection

The existing query remains owner-scoped and preserves the same sorting behavior. The unit test verifies that the owner filter is still applied.

## Measurement

Run the benchmark from the project root:

```powershell
node week5-optimization/benchmark.js
```

The benchmark seeds 500 tasks and measures 10 runs of the non-lean query versus the lean query. It prints average, minimum, and maximum query time and calculates the percentage change.

**Important:** The actual benchmark numbers must be taken from the student's Windows run. No performance improvement percentage is claimed here until that run is completed.
