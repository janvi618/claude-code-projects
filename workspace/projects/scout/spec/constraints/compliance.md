# Compliance Constraints

- Only scrape publicly available content. Never circumvent login walls, paywalls, or access controls.
- Respect robots.txt on all scraped domains. If robots.txt disallows the path, do not scrape it.
- Include a descriptive User-Agent header on all HTTP requests: "SCOUT/1.0 (competitive intelligence; contact: admin@yourdomain.com)"
- Minimum 2-second delay between requests to the same domain.
- Do not store or process any personally identifiable information (PII) beyond user email addresses for authentication and brief delivery.
- All collected content is publicly available competitive intelligence. The system does not store proprietary General Mills data.
- LLM prompts must not instruct models to impersonate real people, generate misleading content, or produce outputs that could constitute defamation.
- Audit log: all admin actions (user creation, source changes, manual brief triggers) must be logged with timestamp, user email, and action description. Logs retained for 12 months.
