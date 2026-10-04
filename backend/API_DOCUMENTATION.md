# InternTrack REST API Documentation

**Version:** 2.0.0  
**Local base URL:** `http://localhost:8087/api`  
**Content type:** `application/json`

## 1. Authentication

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

Tokens are returned by registration and login. The server signs them with `JWT_SECRET`; the default expiration is `1d`.

### POST `/auth/register`

Creates a new intern account.

**Request**
```json
{
  "name": "Alex Kumar",
  "email": "alex@example.com",
  "password": "password123"
}
```

**201 Created**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "USER_ID",
      "name": "Alex Kumar",
      "email": "alex@example.com",
      "role": "intern"
    },
    "token": "JWT_TOKEN"
  }
}
```

Public registration intentionally does **not** accept a client-supplied role. New users are always created as `intern`.

**Errors:** `400` missing/invalid input, `409` duplicate email, `500` unexpected server error.

### POST `/auth/login`

Authenticates a registered user.

**Request**
```json
{"email":"alex@example.com","password":"password123"}
```

**200 OK:** returns `data.user` and `data.token`.

**Errors:** `400` missing fields, `401` invalid credentials, `500` unexpected server error.

---

## 2. Task CRUD

Task endpoints are protected and automatically scoped to the authenticated user's `owner`.

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| POST | `/tasks` | Create a task | 201 |
| GET | `/tasks` | List the current user's tasks | 200 |
| GET | `/tasks/:id` | Read one owned task | 200 |
| PATCH | `/tasks/:id` | Update editable task fields | 200 |
| DELETE | `/tasks/:id` | Delete one owned task | 200 |

### POST `/tasks`

**Request**
```json
{
  "title": "Build responsive dashboard",
  "description": "Create and test the internship dashboard.",
  "category": "Frontend",
  "status": "In progress",
  "priority": "high",
  "dueDate": "2026-09-17",
  "estimatedHours": 4,
  "progress": 65
}
```

`title` and `description` are required. `status` must be `Not started`, `In progress`, `Ready for review`, or `Completed`. `priority` must be `low`, `medium`, or `high`. `progress` must be 0–100.

The server ignores protected fields such as `owner` supplied by clients and uses the authenticated user's ID.

**201 Created:** `data` contains the persisted MongoDB document.

### GET `/tasks`

Returns only the authenticated user's tasks.

Optional filter:
```http
GET /api/tasks?status=Completed
```

**200 OK**
```json
{
  "success": true,
  "count": 1,
  "data": []
}
```

### GET `/tasks/:id`

Returns one task owned by the authenticated user.

- `400` invalid MongoDB ObjectId
- `404` task does not exist or is not owned by the user
- `200` task returned

### PATCH `/tasks/:id`

Updates one or more editable fields.

**Request**
```json
{"status":"Completed","progress":100}
```

The `owner` field cannot be changed through this endpoint.

**200 OK:** returns the updated task.

### DELETE `/tasks/:id`

Deletes an owned task.

**200 OK**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {"id":"TASK_ID"}
}
```

---

## 3. Health and error responses

### GET `/health`

No authentication required.

**200 OK**
```json
{
  "success": true,
  "message": "InternTrack API is running",
  "timestamp": "2026-09-12T00:00:00.000Z"
}
```

### Common error format

```json
{"success":false,"message":"Human-readable error message"}
```

| Code | Meaning |
|---|---|
| 400 | Invalid input, validation error or invalid ID |
| 401 | Missing, invalid or expired JWT |
| 404 | Route/resource not found |
| 409 | Duplicate unique value |
| 500 | Unexpected server error |

## 4. Data model

**User:** name, email, bcrypt-hashed password, role, createdAt, updatedAt.

**Task:** title, description, category, status, priority, dueDate, estimatedHours, progress, immutable owner reference, createdAt, updatedAt.

Indexes support common owner/status and owner/due-date queries.

## 5. Example curl flow

```bash
# Register
curl -X POST http://localhost:8087/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Alex Kumar\",\"email\":\"alex@example.com\",\"password\":\"password123\"}"

# Login
curl -X POST http://localhost:8087/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"alex@example.com\",\"password\":\"password123\"}"

# Use the returned token
curl http://localhost:8087/api/tasks ^
  -H "Authorization: Bearer YOUR_TOKEN"
```
