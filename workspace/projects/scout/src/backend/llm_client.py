"""
Unified LLM client for SCOUT.

Abstracts Anthropic, OpenAI, and Google Gemini into a single async interface.
All LLM calls in the application go through this module — never call providers directly.

Pricing (as of 2025, update when models change):
  - claude-sonnet-4-20250514:  $3/MTok input,  $15/MTok output
  - claude-opus-4-20250514:    $15/MTok input, $75/MTok output
  - claude-haiku-4-5-20251001: $0.80/MTok input, $4/MTok output
  - gemini-2.0-flash:          $0.075/MTok input, $0.30/MTok output
  - gpt-4o:                    $2.50/MTok input, $10/MTok output
  - text-embedding-3-small:    $0.02/MTok input
"""

import asyncio
import json
import logging
import time
from dataclasses import dataclass
from decimal import Decimal
from typing import Literal, Optional

logger = logging.getLogger(__name__)

# ─── Pricing table (USD per million tokens) ─────────────────────────────────
PRICING: dict[str, dict[str, float]] = {
    "claude-sonnet-4-20250514":  {"input": 3.00,   "output": 15.00},
    "claude-opus-4-20250514":    {"input": 15.00,  "output": 75.00},
    "claude-haiku-4-5-20251001": {"input": 0.80,   "output": 4.00},
    "gemini-2.0-flash":          {"input": 0.075,  "output": 0.30},
    "gpt-4o":                    {"input": 2.50,   "output": 10.00},
    "text-embedding-3-small":    {"input": 0.02,   "output": 0.0},
}

# ─── Fallback routing ────────────────────────────────────────────────────────
FALLBACKS: dict[str, tuple[str, str]] = {
    "claude-sonnet-4-20250514": ("openai", "gpt-4o"),
    "claude-opus-4-20250514":   ("openai", "gpt-4o"),
    "gemini-2.0-flash":         ("anthropic", "claude-haiku-4-5-20251001"),
}


# ─── Data classes ────────────────────────────────────────────────────────────

@dataclass
class LLMResponse:
    content: str
    input_tokens: int
    output_tokens: int
    model: str
    provider: str
    latency_ms: int


class LLMProviderError(Exception):
    def __init__(self, provider: str, model: str, message: str):
        self.provider = provider
        self.model = model
        self.message = message
        super().__init__(f"[{provider}/{model}] {message}")


# ─── Cost calculation ────────────────────────────────────────────────────────

def _calculate_cost(model: str, input_tokens: int, output_tokens: int) -> Decimal:
    pricing = PRICING.get(model, {"input": 0.0, "output": 0.0})
    cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000
    return Decimal(str(round(cost, 6)))


# ─── Usage logging ───────────────────────────────────────────────────────────

async def _log_usage(
    provider: str,
    model: str,
    task_type: str,
    input_tokens: int,
    output_tokens: int,
    cost: Decimal,
) -> None:
    """Persist LLM usage to the database for cost tracking."""
    try:
        from database import AsyncSessionLocal
        from models.llm_usage import LLMUsage

        async with AsyncSessionLocal() as session:
            usage = LLMUsage(
                provider=provider,
                model=model,
                task_type=task_type,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                estimated_cost_usd=cost,
            )
            session.add(usage)
            await session.commit()
    except Exception as exc:
        # Never let logging failure break the main flow
        logger.warning("Failed to log LLM usage to database: %s", exc)


# ─── Provider implementations ────────────────────────────────────────────────

async def _call_anthropic(
    model: str,
    messages: list[dict],
    system: Optional[str],
    response_format: Literal["text", "json"],
    max_tokens: int,
    temperature: float,
) -> LLMResponse:
    """Call Anthropic Claude API."""
    from config import get_settings
    import anthropic

    settings = get_settings()
    if not settings.anthropic_api_key:
        raise LLMProviderError("anthropic", model, "ANTHROPIC_API_KEY not configured")

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    # For JSON responses, instruct the model in the system prompt
    effective_system = system or ""
    if response_format == "json":
        json_instruction = "\n\nIMPORTANT: You must respond with valid JSON only. No markdown, no explanation, just the JSON object."
        effective_system = effective_system + json_instruction

    start_ms = time.monotonic()
    try:
        kwargs = dict(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=messages,
        )
        if effective_system:
            kwargs["system"] = effective_system

        response = await client.messages.create(**kwargs)
        latency_ms = int((time.monotonic() - start_ms) * 1000)

        content = response.content[0].text
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens

        return LLMResponse(
            content=content,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            model=model,
            provider="anthropic",
            latency_ms=latency_ms,
        )
    except anthropic.RateLimitError as e:
        raise  # Let caller handle retry
    except anthropic.APIStatusError as e:
        raise


async def _call_openai(
    model: str,
    messages: list[dict],
    system: Optional[str],
    response_format: Literal["text", "json"],
    max_tokens: int,
    temperature: float,
) -> LLMResponse:
    """Call OpenAI API."""
    from config import get_settings
    from openai import AsyncOpenAI

    settings = get_settings()
    if not settings.openai_api_key:
        raise LLMProviderError("openai", model, "OPENAI_API_KEY not configured")

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    # Prepend system message if provided
    full_messages = []
    if system:
        full_messages.append({"role": "system", "content": system})
    full_messages.extend(messages)

    kwargs = dict(
        model=model,
        messages=full_messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )
    if response_format == "json":
        kwargs["response_format"] = {"type": "json_object"}

    start_ms = time.monotonic()
    response = await client.chat.completions.create(**kwargs)
    latency_ms = int((time.monotonic() - start_ms) * 1000)

    content = response.choices[0].message.content or ""
    input_tokens = response.usage.prompt_tokens
    output_tokens = response.usage.completion_tokens

    return LLMResponse(
        content=content,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        model=model,
        provider="openai",
        latency_ms=latency_ms,
    )


async def _call_google(
    model: str,
    messages: list[dict],
    system: Optional[str],
    response_format: Literal["text", "json"],
    max_tokens: int,
    temperature: float,
) -> LLMResponse:
    """Call Google Gemini API."""
    from config import get_settings
    import google.generativeai as genai

    settings = get_settings()
    if not settings.google_api_key:
        raise LLMProviderError("google", model, "GOOGLE_API_KEY not configured")

    genai.configure(api_key=settings.google_api_key)

    generation_config = genai.types.GenerationConfig(
        max_output_tokens=max_tokens,
        temperature=temperature,
    )

    # Build system instruction
    system_instruction = system
    if response_format == "json":
        json_note = "Respond with valid JSON only. No markdown formatting, no code blocks."
        system_instruction = (system_instruction + "\n\n" + json_note) if system_instruction else json_note
        generation_config.response_mime_type = "application/json"

    gemini_model = genai.GenerativeModel(
        model_name=model,
        generation_config=generation_config,
        system_instruction=system_instruction,
    )

    # Convert OpenAI-style messages to Gemini format
    gemini_messages = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        gemini_messages.append({"role": role, "parts": [msg["content"]]})

    start_ms = time.monotonic()
    response = await gemini_model.generate_content_async(gemini_messages)
    latency_ms = int((time.monotonic() - start_ms) * 1000)

    content = response.text
    # Gemini usage metadata
    try:
        input_tokens = response.usage_metadata.prompt_token_count
        output_tokens = response.usage_metadata.candidates_token_count
    except AttributeError:
        input_tokens = 0
        output_tokens = 0

    return LLMResponse(
        content=content,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        model=model,
        provider="google",
        latency_ms=latency_ms,
    )


# ─── Retry helper ────────────────────────────────────────────────────────────

_RETRYABLE_STATUS = {429, 500, 502, 503}


def _is_retryable(exc: Exception) -> bool:
    """Return True if the exception represents a retryable error."""
    import anthropic
    from openai import RateLimitError as OAIRateLimit, APIStatusError as OAIStatusError

    if isinstance(exc, anthropic.RateLimitError):
        return True
    if isinstance(exc, anthropic.APIStatusError) and exc.status_code in _RETRYABLE_STATUS:
        return True
    if isinstance(exc, OAIRateLimit):
        return True
    if isinstance(exc, OAIStatusError) and exc.status_code in _RETRYABLE_STATUS:
        return True
    return False


async def _call_with_retry(call_fn, provider: str, model: str, **kwargs) -> LLMResponse:
    """Call an LLM function, retrying once on rate limit / server errors with 5s backoff."""
    for attempt in range(2):
        try:
            return await call_fn(model=model, **kwargs)
        except Exception as exc:
            if attempt == 0 and _is_retryable(exc):
                logger.warning(
                    "LLM call failed (attempt 1), retrying in 5s: provider=%s model=%s error=%s",
                    provider, model, type(exc).__name__,
                )
                await asyncio.sleep(5)
                continue
            # Second failure or non-retryable — propagate as LLMProviderError
            logger.error(
                "LLM call failed: provider=%s model=%s error=%s: %s",
                provider, model, type(exc).__name__, exc,
            )
            raise LLMProviderError(provider, model, str(exc)) from exc
    # Should not reach here
    raise LLMProviderError(provider, model, "Unexpected retry logic exit")


# ─── Public interface ────────────────────────────────────────────────────────

async def complete(
    provider: Literal["anthropic", "openai", "google"],
    model: str,
    messages: list[dict],
    system: Optional[str] = None,
    response_format: Literal["text", "json"] = "text",
    max_tokens: int = 4096,
    temperature: float = 0.0,
    task_type: str = "general",
) -> LLMResponse:
    """
    Make a completion request to the specified LLM provider.

    On rate limit or server error, retries once with 5s backoff.
    On second failure, attempts fallback model if configured.
    On fallback failure, raises LLMProviderError.
    """
    CALL_FUNS = {
        "anthropic": _call_anthropic,
        "openai": _call_openai,
        "google": _call_google,
    }
    call_fn = CALL_FUNS.get(provider)
    if not call_fn:
        raise LLMProviderError(provider, model, f"Unknown provider: {provider}")

    try:
        result = await _call_with_retry(
            call_fn,
            provider=provider,
            model=model,
            messages=messages,
            system=system,
            response_format=response_format,
            max_tokens=max_tokens,
            temperature=temperature,
        )
    except LLMProviderError as primary_error:
        # Try fallback if configured
        fallback = FALLBACKS.get(model)
        if fallback:
            fallback_provider, fallback_model = fallback
            fallback_fn = CALL_FUNS.get(fallback_provider)
            logger.warning(
                "Primary LLM failed, attempting fallback: %s/%s -> %s/%s",
                provider, model, fallback_provider, fallback_model,
            )
            try:
                result = await _call_with_retry(
                    fallback_fn,
                    provider=fallback_provider,
                    model=fallback_model,
                    messages=messages,
                    system=system,
                    response_format=response_format,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
            except LLMProviderError as fallback_error:
                logger.error(
                    "Fallback LLM also failed: %s/%s", fallback_provider, fallback_model
                )
                raise fallback_error
        else:
            raise primary_error

    # Log usage asynchronously
    cost = _calculate_cost(result.model, result.input_tokens, result.output_tokens)
    asyncio.create_task(
        _log_usage(result.provider, result.model, task_type, result.input_tokens, result.output_tokens, cost)
    )

    logger.info(
        "LLM call complete: provider=%s model=%s task=%s in_tok=%d out_tok=%d latency_ms=%d cost_usd=%.6f",
        result.provider, result.model, task_type,
        result.input_tokens, result.output_tokens,
        result.latency_ms, float(cost),
    )

    return result


async def embed(text: str) -> list[float]:
    """
    Generate a 1536-dimensional embedding using OpenAI text-embedding-3-small.
    No fallback — embeddings require the same model for consistent similarity search.
    """
    from config import get_settings
    from openai import AsyncOpenAI

    settings = get_settings()
    if not settings.openai_api_key:
        raise LLMProviderError("openai", "text-embedding-3-small", "OPENAI_API_KEY not configured")

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    try:
        response = await client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        embedding = response.data[0].embedding
        token_count = response.usage.total_tokens

        cost = _calculate_cost("text-embedding-3-small", token_count, 0)
        asyncio.create_task(
            _log_usage("openai", "text-embedding-3-small", "embedding", token_count, 0, cost)
        )

        return embedding
    except Exception as exc:
        logger.error("Embedding failed: %s", exc)
        raise LLMProviderError("openai", "text-embedding-3-small", str(exc)) from exc
