# API Documentation

The REST API is built using Next.js App Router API Routes (`app/api/...`). All endpoints expect and return JSON.

## Authentication
Unless otherwise specified, all endpoints require the user to be authenticated. The backend verifies the session token automatically. If a request is unauthenticated, it returns a `401 Unauthorized` response.

## Endpoints

### `/api/applications`
- **GET**: Fetch all job applications for the logged-in user.
  - *Query Params:* `status` (filter by status), `query` (search by company/role).
- **POST**: Create a new job application.
  - *Body:* `{ company: string, role: string, location?: string, jobUrl?: string, salary?: string, status: string, notes?: string }`

### `/api/applications/[id]`
- **PATCH**: Update a specific job application.
- **DELETE**: Delete a specific job application.

### `/api/resumes/upload`
- **POST**: Upload a resume PDF. Multipart form-data expected.

### `/api/ai/extract-skills`
- **POST**: Extract skills from parsed resume text via LLM.

### `/api/ai/match`
- **POST**: Match a resume against a job description. Returns match score and suggestions.

### `/api/automation/run`
- **POST**: Triggers an asynchronous browser automation task by dispatching it to the Redis queue.

## Error Handling
Standard HTTP status codes are used:
- `200/201`: Success
- `400`: Bad Request (invalid data)
- `401`: Unauthorized
- `500`: Internal Server Error

Error payloads generally follow:
```json
{
  "message": "Human readable error string"
}
```
