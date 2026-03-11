# Failure Mode: LLM Provider Outage

## Scenario
The Anthropic API returns 503 errors for all requests. The extraction pipeline (which depends on Claude Sonnet) should retry once after 5 seconds. If the retry fails, it should log the error, skip processing for this batch, and leave raw_content items in an "unprocessed" state to be picked up on the next cycle. It must not crash the scheduler or affect other components. If the outage persists during brief generation time, the system should send a fallback notification email.

# Failure Mode: Source Returns 403/429

## Scenario
A competitor newsroom starts returning HTTP 403 (Forbidden) or 429 (Too Many Requests). The collector should log the error, increment the consecutive_failures counter for that source, and continue collecting from other sources. After 3 consecutive failures, the source should be marked as unhealthy. The admin dashboard should show this source as unhealthy. Collection should continue to be attempted on schedule (the source might come back).

# Failure Mode: Database Connection Lost

## Scenario
The PostgreSQL container restarts unexpectedly. In-flight API requests should return a 503 error with a meaningful error message, not a stack trace. The FastAPI backend should automatically reconnect when PostgreSQL comes back. No data should be corrupted. The scheduler should resume normal operation without manual intervention.

# Failure Mode: Invalid LLM Response

## Scenario
Claude Sonnet returns a response that does not conform to the expected JSON extraction schema (e.g., missing required fields, malformed JSON). The extraction pipeline should catch the parsing error, log the raw response for debugging, mark the item as "extraction_failed" in the database, and continue processing the next item. It must not crash or stop the batch.
