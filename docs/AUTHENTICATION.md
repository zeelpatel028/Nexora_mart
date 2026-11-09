# Nexora Mart — Authentication & Session Lifecycle

This document describes the authentication protocols, token issuance, session refresh rules, token rotation, and security specifications implemented in Nexora Mart.

---

## 1. Dual-Token Architecture & Security Policies

Nexora Mart utilizes a dual-token authentication scheme consisting of a short-lived JSON Web Token (Access Token) and a server-tracked Refresh Token.

### Policy Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Access Token Lifetime** | `15 minutes` | Limits exposure if intercepted over the wire. |
| **Refresh Session Ceiling** | `15 hours` | Absolute session maximum. Session termination occurs after 15h regardless of activity. |
| **Signing Algorithm** | `HMAC-SHA256 (HS256)` | Cryptographically signed token payloads. |
| **Refresh Token Storage** | SHA-256 Hash | Raw refresh token is never stored in plaintext in the database. |
| **Rotation Policy** | Single-Use Rotation | Old refresh token is revoked immediately upon each refresh. |
| **Concurrency Safeguard** | Promise Queue | Frontend queues pending requests during an active token refresh. |

> **Important**: The requirement *"refresh token every 15 min and 15h"* is implemented as:
> 1. Access token expires every **15 minutes**.
> 2. The entire user session has a hard ceiling of **15 hours** from initial authentication.
> 3. Refreshing the access token **does not** extend the 15-hour session horizon. When `session_created_at + 15 hours` is reached, `POST /auth/refresh` responds with HTTP `401 Unauthorized` (`"Session has reached maximum 15-hour lifetime. Please log in again."`), logging the user out.

---

## 2. Token Anatomy & Claims

### Access Token (JWT)
The JWT is generated in `backend/app/utils/security.py` and contains strictly minimal claims to minimize payload size and avoid stale profile data:

```json
{
  "sub": "42",
  "sid": "f3b890a1-7782-411a-bc1e-2895fbc9a882",
  "iat": 1731178800,
  "exp": 1731179700,
  "iss": "nexora-mart-api",
  "aud": "nexora-mart-app"
}
```

- `sub` (*Subject*): The primary key user ID (stringified).
- `sid` (*Session ID*): Unique UUID representing the refresh token session family.
- `iat` (*Issued At*): Unix epoch timestamp.
- `exp` (*Expiration*): Unix epoch timestamp (`iat + 15 minutes`).
- `iss` (*Issuer*): Configured API issuer (`nexora-mart-api`).
- `aud` (*Audience*): Intended client consumer (`nexora-mart-app`).

### Refresh Token
A cryptographically generated 48-byte URL-safe base64 string:
```text
nrt_4f89d0a6c8e312b9a7c2e0b5d8f1a4e7...
```
- Transmitted to the client over HTTPS.
- Converted via SHA-256 into a 64-character hexadecimal digest before being persisted into the `refresh_tokens.token_hash` column.
- Database compromises do not reveal active refresh tokens.

---

## 3. End-to-End Authentication Workflows

### 3.1. Registration Flow
```
Client                     Backend API                  Database
  |                             |                           |
  | 1. GET /store-types         |                           |
  |---------------------------->|                           |
  | 2. Returns Active Types     |                           |
  |<----------------------------|                           |
  |                             |                           |
  | 3. POST /auth/register      |                           |
  |   (name, email, password,   |                           |
  |    store_type_id, ...)      |                           |
  |---------------------------->|                           |
  |                             |-- Validate store_type_id  |
  |                             |-- Hash password (bcrypt)  |
  |                             |-- BEGIN TRANSACTION       |
  |                             |   Insert User             |
  |                             |   Insert Store (type_id)  |
  |                             |   Insert StoreConfig      |
  |                             |-- COMMIT TRANSACTION      |
  | 4. Returns 201 + Tokens     |                           |
  |<----------------------------|                           |
```

### 3.2. Login Flow
1. Client submits email and plaintext password to `POST /auth/login`.
2. Backend queries user by normalized email and verifies password hash using `bcrypt.checkpw()`.
3. Checks `is_active` flag.
4. Generates a new `session_id` UUID and an initial refresh token with an expiration timestamp set to `now + 15 hours`.
5. Hashes the refresh token and stores it in `refresh_tokens`.
6. Issues the 15-minute access JWT.
7. Responds with tokens, user profile, and active store metadata.

### 3.3. Refresh Flow & Single-Use Rotation
1. Client detects access token expiry (via expired timestamp or HTTP 401).
2. Client sends current refresh token to `POST /auth/refresh`.
3. Backend calculates SHA-256 of incoming refresh token.
4. Queries `refresh_tokens` matching `token_hash`.
5. Verification checks:
   - Record exists and `revoked_at` is NULL.
   - `now < expires_at`.
   - `session_age < 15 hours`.
6. **Rotation Action**:
   - Updates previous record: `revoked_at = now`.
   - Issues a newly generated refresh token with the **same** original session expiration time (`expires_at` retained).
   - Inserts new record into `refresh_tokens`.
   - Issues a new 15-minute access JWT.
7. Responds with new `access_token`, `refresh_token`, and user/store context.

### 3.4. Logout Flow
1. Client calls `POST /auth/logout` supplying the refresh token in request body and access token in `Authorization: Bearer` header.
2. Backend computes hash and sets `revoked_at = now` for the active token or invalidates the entire session family.
3. Client deletes cached tokens and profile data from local device storage.

---

## 4. Frontend Token Lifecycle & Axios Interceptor

The React Native application (`react-native-app/src/api/apiClient.ts`) uses an advanced request queueing architecture to prevent duplicate refresh requests and race conditions:

```typescript
// Failed Queue Management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
```

### Interceptor Logic:
1. **Request Interceptor**: Adds `Authorization: Bearer <access_token>` to every outgoing request.
2. **Response Interceptor**:
   - If response is successful, passes through.
   - If response status is `401 Unauthorized` and the request was not an auth endpoint (`/auth/login`, `/auth/refresh`):
     - If a refresh is already in flight, pushes the request promise into `failedQueue`.
     - Otherwise, marks `isRefreshing = true` and invokes `authService.refreshToken()`.
     - On successful refresh: saves new tokens, retries original failed request, and drains `failedQueue`.
     - On refresh error or 15-hour expiry: clears `failedQueue`, logs user out, and redirects to Login Screen.

