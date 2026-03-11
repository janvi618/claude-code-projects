# Security Constraints

- All external traffic must use HTTPS. Caddy reverse proxy handles automatic TLS via Let's Encrypt.
- LLM API keys must be stored encrypted in the database (AES-256-GCM). The encryption key is loaded from the `ENCRYPTION_KEY` environment variable and must never be logged, printed, or included in error messages.
- Magic-link tokens must expire after 15 minutes and be single-use.
- Session cookies must be httpOnly, secure, sameSite=strict, with a 7-day expiry.
- All API endpoints (except `/api/auth/*`) must require a valid session. Admin endpoints must additionally verify `role = admin`.
- User input must be sanitized before inclusion in LLM prompts to prevent prompt injection. Use a basic sanitization function that strips common injection patterns.
- Rate limit the chat endpoint to 20 requests per user per hour.
- Rate limit the login/magic-link endpoint to 5 requests per email per hour.
- Web scrapers must respect robots.txt. If a site's robots.txt disallows crawling, skip that source and log a warning.
- No user credentials, API keys, or sensitive configuration may appear in git-committed code or log files.
