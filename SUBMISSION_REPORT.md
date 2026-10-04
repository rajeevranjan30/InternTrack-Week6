# Week 3 Submission Report — InternTrack

## 1. Assignment objective

The Week 3 objective is to build RESTful back-end APIs that perform CRUD operations, communicate with a database, validate requests, handle errors securely, and include tests and professional API documentation.

InternTrack extends the Week 2 frontend with a Node.js/Express REST API and MongoDB persistence.

## 2. Requirement-to-implementation mapping

| Assignment requirement | Implementation | Evidence |
|---|---|---|
| Back-end framework | Node.js + Express | `backend/package.json`, `src/app.js` |
| RESTful APIs | Resource-based `/api/tasks` routes | `src/routes/taskRoutes.js` |
| CRUD | POST, GET list, GET one, PATCH, DELETE | `src/controllers/taskController.js` |
| Database | MongoDB + Mongoose | `src/models/User.js`, `Task.js`, `src/server.js` |
| Authentication | JWT register/login flow | `authController.js`, `middleware/auth.js` |
| Validation | Request middleware + Mongoose schema rules | `middleware/validate.js`, models |
| Error handling | Centralized JSON errors + 404 handler | `middleware/errorHandler.js`, `app.js` |
| Security | bcrypt, JWT secret, Helmet, CORS allow-list, rate limiting, body limit | `authController.js`, `app.js`, `.env.example` |
| Automated tests | Jest + Supertest + temporary MongoDB | `backend/tests/api.test.js` |
| API documentation | Endpoint table, bodies, responses, status codes and auth | `backend/API_DOCUMENTATION.md` |
| Frontend integration | Login, create, list, update, delete and refresh via Fetch | `js/app.js` |

## 3. Development process

1. Reviewed the Week 2 frontend and kept the three-view InternTrack structure.
2. Identified the main backend resource as `Task` and the supporting `User` resource.
3. Designed Mongoose schemas with required fields, enums, ranges, timestamps and indexes.
4. Added registration/login and JWT authentication.
5. Separated routes, controllers, models, middleware and token utilities.
6. Added request validation before database writes.
7. Added owner-based authorization so task queries are scoped to the authenticated user.
8. Added security middleware and environment-based configuration.
9. Integrated the frontend with the API using `fetch()`.
10. Added HTTP-level automated tests using an isolated temporary MongoDB database.
11. Documented every endpoint, request example, response format and expected HTTP status.
12. Performed a final consistency audit so the README and API documentation describe the implementation actually present in the source.

## 4. Key design decisions

### Owner-scoped tasks
Every task stores an `owner` reference to the User document. Protected queries use both the task ID and `req.user.id`. This prevents a logged-in user from reading or modifying another user's task through the normal task endpoints.

### Update allow-list
Task updates do not pass the entire request body directly to MongoDB. The controller copies only approved editable fields. In particular, `owner` cannot be reassigned by a client.

### Authentication security
Passwords are never stored as plaintext. bcrypt hashes them before persistence. JWT secrets and expiry are configured through environment variables.

### Layered validation
Simple request validation gives clear client-facing messages, while Mongoose schema validation provides a second data-integrity layer.

### Separated application startup
`src/app.js` creates the Express application without opening a database connection. `src/server.js` loads environment variables, connects to MongoDB and starts the listener. This makes Supertest able to import the application directly for tests.

## 5. Testing strategy

The automated suite covers:

- health endpoint
- registration
- password hashing
- duplicate email
- invalid login
- missing authentication
- task creation
- task listing
- single-task read
- task update
- status filtering
- task deletion
- validation errors
- invalid IDs
- cross-user authorization
- unknown routes

The tests use `mongodb-memory-server`, so they run against an isolated temporary MongoDB instance rather than a personal development database.

For the final submission, run `npm test` and capture the real terminal result. Also capture genuine screenshots of the API requests/responses and browser integration. Screenshots must be taken from the working project and must not be fabricated.

## 6. Security and error-handling evidence

The implementation includes:

- bcrypt password hashing
- JWT authentication
- owner-based authorization
- public registration restricted to the `intern` role
- Helmet security headers
- CORS allow-list
- rate limiting
- 100 KB JSON body limit
- disabled `x-powered-by`
- environment variables for secrets
- `.gitignore` protection for `.env`
- validation errors with `400`
- authentication errors with `401`
- missing resources/routes with `404`
- duplicate records with `409`
- unexpected errors with `500`

This is an educational project and does not claim to provide complete production security.

## 7. Evidence checklist for submission

Capture actual evidence for:

1. `npm install` completing successfully.
2. MongoDB connection and backend startup.
3. `GET /api/health`.
4. Successful registration.
5. Successful login.
6. Successful `POST /api/tasks`.
7. Successful `GET /api/tasks`.
8. Successful `GET /api/tasks/:id`.
9. Successful `PATCH /api/tasks/:id`.
10. Successful `DELETE /api/tasks/:id`.
11. Validation failure (`400`).
12. Unauthorized request (`401`).
13. Cross-user access rejection (`404`).
14. `npm test` passing.
15. Frontend dashboard showing database-backed tasks.
16. Frontend create/update/delete flow.

Hide or redact JWT values in screenshots when appropriate.

## 8. Evaluator evidence map

The implementation should be evaluated using the following evidence path:

| Requirement | Code location | Demonstration |
|---|---|---|
| REST API | `backend/src/routes/` + controllers | Postman/curl requests |
| CRUD | `taskController.js` | POST, GET, GET by ID, PATCH, DELETE |
| Database | `models/` + `server.js` | Persistent MongoDB data |
| Authentication | auth controller + JWT middleware | Register/login/protected route |
| Validation | `middleware/validate.js` + models | Invalid-input `400` |
| Error handling | `errorHandler.js` + 404 route | Structured error responses |
| Security | `app.js` + auth/task controllers | Unauthorized and cross-user tests |
| Tests | `tests/api.test.js` | Actual `npm test` output |
| Documentation | `API_DOCUMENTATION.md` | Endpoint/request/response reference |
| Frontend integration | `js/app.js` | Browser CRUD workflow |

### Submission evidence rule

The report deliberately does not contain invented screenshots or invented test results. After running the project, attach only genuine evidence. If a test fails, fix the implementation and then capture the successful result.

## 9. Final evaluator-facing summary

InternTrack satisfies the Week 3 functional requirements through a complete authenticated task CRUD API backed by MongoDB, with request validation, owner-based authorization, centralized errors, security middleware, automated HTTP tests and frontend integration. The implementation goes beyond basic CRUD by adding validation, owner authorization, password hashing, JWT authentication, centralized errors, security middleware, automated HTTP tests, frontend integration and detailed API documentation.

The submission should only claim tests or screenshots that have actually been executed and captured by the student.
