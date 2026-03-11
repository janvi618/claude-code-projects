# LLM Provider Contracts

## Unified Interface

All LLM interactions go through a single async Python module (`llm_client.py`) that abstracts provider differences.

```python
# Core function signature
async def complete(
    provider: Literal["anthropic", "openai", "google"],
    model: str,
    messages: list[dict],
    system: str | None = None,
    response_format: Literal["text", "json"] = "text",
    max_tokens: int = 4096,
    temperature: float = 0.0,
) -> LLMResponse

# Return type
@dataclass
class LLMResponse:
    content: str                 # The model's text response
    input_tokens: int            # Token count for cost tracking
    output_tokens: int           # Token count for cost tracking
    model: str                   # Actual model used (may differ if fallback triggered)
    provider: str                # Provider that served the response
    latency_ms: int              # Round-trip time in milliseconds

# Embedding function
async def embed(text: str) -> list[float]
    # Always uses OpenAI text-embedding-3-small
    # Returns 1536-dimensional vector
```

## Provider Configuration

Each provider reads its API key from an environment variable:
- `ANTHROPIC_API_KEY` for Anthropic (Claude)
- `OPENAI_API_KEY` for OpenAI (GPT, embeddings)
- `GOOGLE_API_KEY` for Google (Gemini)

If a key is missing, the provider is marked as unavailable. The system must boot successfully even if only one provider is configured (with degraded functionality).

## Model Assignments

| Task | Provider | Model | Fallback |
|------|----------|-------|----------|
| Article extraction | anthropic | claude-sonnet-4-20250514 | openai/gpt-4o |
| Relevance scoring | google | gemini-2.0-flash | anthropic/claude-haiku-4-5-20251001 |
| Daily brief synthesis | anthropic | claude-opus-4-20250514 | openai/gpt-4o |
| Research chat | anthropic | claude-sonnet-4-20250514 | openai/gpt-4o |
| Embeddings | openai | text-embedding-3-small | (no fallback) |

## Error Handling

1. On provider error (HTTP 429, 500, 502, 503): wait 5 seconds, retry once.
2. On second failure: attempt fallback model if configured.
3. On fallback failure: raise `LLMProviderError(provider, model, error_message)`.
4. Never silently swallow errors. Always log provider, model, error type, and response status.

## Cost Tracking

After every successful LLM call, log to a `llm_usage` table:
- timestamp, provider, model, task_type, input_tokens, output_tokens, estimated_cost_usd

Estimated cost is calculated from hardcoded pricing (updated when models change):
- Claude Sonnet input: $3/MTok, output: $15/MTok
- Claude Opus input: $15/MTok, output: $75/MTok
- Gemini Flash input: $0.075/MTok, output: $0.30/MTok
- GPT-4o input: $2.50/MTok, output: $10/MTok
- text-embedding-3-small: $0.02/MTok
