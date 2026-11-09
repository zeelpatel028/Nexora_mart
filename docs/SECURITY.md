# Nexora Mart — Security & Store Isolation Architecture

Security and tenant isolation are first-class architectural constraints in Nexora Mart. This document outlines the security controls, threat mitigations, cryptographic standards, and store isolation enforcement mechanisms.

---

## 1. Multi-Tenant Store Isolation (Defense Against BOLA / IDOR)

Broken Object Level Authorization (BOLA / IDOR) is the most critical vulnerability in multi-tenant SaaS. In retail and inventory systems, an attacker might attempt to alter a numeric `store_id` or query an invoice ID belonging to a competitor.

### Nexora Mart Isolation Principles

1. **Authoritative Context Resolution**:
   - The client never dictates the tenant context.
   - The user ID is extracted strictly from the cryptographically signed JWT (`sub` claim).
   - The active `store_id` is resolved on the server side via `get_user_store(db, user_id)`.
2. **Explicit Foreign Key Enforcement**:
   - Every read, create, update, and delete operation on products, bills, customers, suppliers, expenses, and orders is bounded by `filter(Model.store_id == current_store.id)`.
3. **Cross-Tenant Ownership Auditing**:
   - In routes where a path contains `{store_id}`, the backend cross-references the store's `user_id` against the authenticated `user.id`.
   - If an authenticated user attempts to access or modify data belonging to another store, the server immediately rejects the request with an HTTP `403 Forbidden` (`"Unauthorized access to this store"`).

### Automated Isolation Verification
Store isolation is formally tested and verified in `backend/tests/test_store_isolation.py`:
- Creates two distinct merchant users: `Merchant A` (Store A) and `Merchant B` (Store B).
- Verifies that Merchant B querying Store A's products receives an empty result set.
- Verifies that Merchant B attempting to directly access Store A's endpoint receives HTTP `403 Forbidden`.
- Verifies that Merchant B cannot create, update, or delete products, bills, or settings belonging to Store A.

---

## 2. OWASP Top 10 Threat Mitigation Matrix

| Vulnerability | Threat Description | Nexora Mart Architectural Defense |
|---------------|-------------------|-----------------------------------|
| **A01: Broken Access Control (BOLA)** | User A reads/modifies User B's inventory, invoices, or customer khata. | Authoritative server-side store resolution via JWT + mandatory `store_id` foreign key filters + ownership verification in `store_service.py`. |
| **A02: Cryptographic Failures** | Weak password storage or intercepted credentials. | Passwords hashed using `bcrypt` with unique salts. Refresh tokens stored only as SHA-256 hashes. HTTPS enforced. |
| **A03: Injection (SQLi)** | Malicious SQL syntax in queries, search parameters, or filters. | 100% parametrized queries via SQLAlchemy 2.0 ORM. No raw string concatenation in SQL queries. |
| **A04: Insecure Design** | Infinite session extensions via token refresh abuse. | 15-minute short-lived access JWT + 15-hour absolute session ceiling + single-use refresh token rotation. |
| **A05: Security Misconfiguration** | Hard-coded signing keys or default credentials in code. | All secrets (`SECRET_KEY`, database credentials, JWT parameters) loaded from environment variables (`.env`). |
| **A06: Vulnerable Components** | Outdated or compromised libraries. | Pinned dependency versions in `package.json` and `backend/requirements.txt`. |
| **A07: Identification Failures** | Credential stuffing or brute force attacks on login. | SlowAPI rate limiting (5 req/min on `/auth/login`, 10 req/min on `/auth/register`). |
| **A08: Software Integrity Failures** | Unauthorized schema modifications. | Version-controlled Alembic migrations. |
| **A09: Logging & Monitoring Failures** | Passwords or tokens leaking into log output. | Sensitive fields (`password`, `access_token`, `refresh_token`) filtered from log formatters. |
| **A10: Server-Side Request Forgery** | External image fetching causing SSRF. | Image URLs sanitized and validated before display. |

---

## 3. Cryptographic Token Lifecycle & Secret Handling

### Password Hashing
- Algorithm: `bcrypt` (Blowfish-based cipher) with work factor `12`.
- Passwords are never stored in plaintext or logged to stdout.

### Refresh Token Security
- Generation: 48 cryptographically secure random bytes via Python `secrets.token_urlsafe(48)`.
- Database Persistence:
  ```python
  token_hash = hashlib.sha256(raw_refresh_token.encode('utf-8')).hexdigest()
  ```
- Rotation: Consuming a refresh token immediately marks `revoked_at = utcnow()` and issues a replacement. Replay attempts trigger immediate session revocation.

### Safe Response Serialization
- User and Store models serialize to safe Pydantic schemas.
- `password_hash`, `token_hash`, and internal session secrets are excluded from API response schemas.

---

## 4. Mobile Client Security (React Native)

1. **Storage Security**:
   - Access and refresh tokens are stored using isolated device storage.
   - On logout or session expiration, `storage.clearAuth()` purges all credentials, cached profile data, and session timestamps.
2. **Session Expiration Guard**:
   - Upon app startup or foreground restoration, `restoreSession` evaluates `Date.now() > sessionExpiresAt`.
   - If 15 hours have elapsed, session state is cleared without network calls, immediately prompting user re-authentication.

