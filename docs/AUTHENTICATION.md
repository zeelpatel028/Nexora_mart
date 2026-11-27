# Tulsi Mart – Authentication & Security

## 1. Authentication Architecture
Tulsi Mart utilizes stateless JWT (JSON Web Token) authentication with HMAC-SHA256 signature verification.

### Key Security Principles:
1. **Never Trust Client Store IDs**: The client cannot request access to store data by sending arbitrary `store_id` parameters. The server resolves the store identity from the authenticated user claims.
2. **Token Lifespan**: Access tokens have an expiration lifetime of 8 days (`ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 8`).
3. **Password Security**: Passwords are cryptographically hashed using PBKDF2 with SHA-256 and high work iterations via `core/security.py`. Plain text passwords are never stored.

---

## 2. Token Payload Structure
```json
{
  "sub": "user_id_string",
  "email": "owner@tulsimart.com",
  "store_id": 1,
  "role": "OWNER",
  "exp": 1795328400
}
```

---

## 3. FastApi Authentication Dependencies
In `app/api/dependencies.py`:
- `get_current_user`: Validates Authorization header Bearer token and returns the database `User` instance.
- `get_current_store_context`: Fetches the `Store` record associated with the user. All API routes use this dependency to automatically restrict data scoping.
