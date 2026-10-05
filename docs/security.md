# Security & Protection Architecture

Security and privacy are built directly into Social Automation Hub at every layer.

---

## 1. Zero Secrets in Source Code
- API credentials, OAuth client secrets, and access tokens are never committed to git.
- Repository `.gitignore` excludes `.env`, `*.db`, media caches, and build artifacts.
- Environment variables are loaded securely via `pydantic-settings`.

---

## 2. Encryption at Rest (Fernet)
- Social platform access tokens and refresh tokens are encrypted at rest using AES-128-CBC with HMAC-SHA256 authentication via Python's `cryptography.fernet.Fernet`.
- Database dumps cannot reveal cleartext API keys or user social media tokens without the master `ENCRYPTION_KEY`.

---

## 3. Password Hashing
- User authentication uses salted PBKDF2-HMAC-SHA256 with 100,000 iterations and per-user cryptographic salts.
- Passwords are never stored in cleartext.

---

## 4. Input Sanitization & AI Guardrails
- **Prompt Injection Defense**: AI outputs are strictly sanitized to block shell command patterns (`rm -rf`, `powershell`, `cmd.exe`, `sudo`).
- Parameterized SQL: SQLAlchemy ORM prevents SQL injection across all queries.
- File Hash Deduplication: Uploaded media assets are hashed via SHA-256 to prevent duplicate upload bloat and path traversal attacks.

---

## 5. Webhook Signature Validation
- Incoming webhooks (`/webhooks/{platform}`) validate cryptographic HMAC signatures and handshake challenge tokens (`hub.challenge`).
