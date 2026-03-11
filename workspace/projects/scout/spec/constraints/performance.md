# Performance Constraints

- Dashboard page load (Intelligence Feed) must complete in under 2 seconds on a 50Mbps connection.
- API response time for list endpoints must be under 500ms for the default query (25 items, no filters).
- Semantic search (pgvector cosine similarity) must return results in under 3 seconds.
- Research Chat end-to-end response time (query → embedding → retrieval → LLM synthesis → response): target under 15 seconds. Maximum acceptable: 30 seconds.
- Daily brief generation must complete in under 5 minutes.
- Total monthly LLM API cost must not exceed $300 at MVP scale (approximately 50-100 items/day, 1 daily brief, 5-10 chat queries/day).
- The system must run on a single server with 4 vCPU, 8GB RAM, 160GB SSD. Docker Compose memory allocation must not exceed 7GB total across all containers.
- PostgreSQL database should handle up to 100,000 intelligence_items rows without query degradation. Add indexes on: `relevance_score`, `processed_at`, `companies` (GIN index on JSONB), and `embedding` (HNSW index for pgvector).
- System uptime target: 99% (allows ~7 hours/month downtime for maintenance).
- Daily brief email delivery must complete within 30 minutes of generation.
