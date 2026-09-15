# API Documentation

The backend of Code Reviewer AI is built with **FastAPI** and uses a modular routing system. All endpoints are prefixed with `/api`.

## 1. Authentication Router (`/api/auth`)

Handles Google OAuth 2.0 and JWT session management.

### `GET /api/auth/login`
Redirects the user to the Google OAuth consent screen.

### `GET /api/auth/callback`
Handles the callback from Google after the user grants consent.
- **Query Params**: `code` (Google authorization code).
- **Process**: Exchanges the code for an access token, retrieves user info, and generates a secure JWT.
- **Returns**: Redirects back to the Streamlit frontend with `?token=<JWT>`.

### `GET /api/auth/me`
Verifies the current user's session token.
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: JSON object containing user details (email, picture, name).

---

## 2. Review Router (`/api/review`)

Handles AI code analysis and secure test case execution.

### `POST /api/review`
Submits code for AI review using the Mistral LLM.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "code": "def two_sum(): pass",
    "language": "python",
    "depth": "comprehensive"
  }
  ```
- **Returns**: A streamed HTTP response (Server-Sent Events) containing markdown-formatted review feedback from Mistral.

### `POST /api/review/execute`
Executes user code securely in an isolated environment against multiple test cases.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "code": "print('Hello, World!')",
    "language": "python",
    "test_cases": [
      {
        "input": "",
        "expected_output": "Hello, World!"
      }
    ]
  }
  ```
- **Returns**: JSON object containing execution status, runtime metrics, memory usage, and passed/failed summary.
