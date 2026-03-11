# AGENTS.md — Instructions for Codex and Other Agents

You are building SCOUT, a competitive intelligence platform for General Mills. Read the specification files in `spec/` before writing any code.

Refer to `CLAUDE.md` for architecture, rules, and file structure conventions — they apply to all agents regardless of provider.

## Additional Notes for Codex/OpenAI Agents

- When generating embeddings, use `text-embedding-3-small` with 1536 dimensions.
- For the frontend, prefer server components and server actions over client-side API calls where possible.
- Use `pnpm` as the package manager for the frontend.
- The backend uses Python 3.12. Use type hints on all function signatures.
