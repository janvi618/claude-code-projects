# Research Chat

## Purpose

An on-demand natural-language query interface that lets users ask questions about the competitive intelligence knowledge base. The system uses Retrieval-Augmented Generation (RAG): it searches the knowledge base first, then synthesizes an answer using Claude Sonnet with source citations.

## Query Pipeline

1. **User sends message** via the chat UI (POST /api/chat).
2. **Generate query embedding** using OpenAI text-embedding-3-small.
3. **Semantic search** against pgvector: cosine similarity search on intelligence_items.embedding, returning top 10 items with similarity score >= 0.3.
4. **Assess sufficiency**: If fewer than 3 items returned with similarity >= 0.5, flag as "low confidence" — supplement with live web search.
5. **Synthesize response** via Claude Sonnet. Prompt includes: the user's question, the retrieved intelligence items (headline, summary, source_url, published_at), and conversation history (last 5 turns). The prompt instructs Claude to:
   - Answer the question directly and concisely
   - Cite specific sources inline using bracketed references [1], [2], etc.
   - If knowledge base data is insufficient, say so explicitly and supplement with general knowledge
   - Suggest 2-3 follow-up questions the user might find useful
6. **Return response** with structured output: response text, array of source citations (title, url, published_at), array of follow-up suggestions.

## Conversation Context

Conversation history is passed in the request body as an array of previous turns. The backend does not persist conversation history — the frontend manages this in browser state. History is limited to the last 5 turns to keep the prompt within context limits.

## Live Web Search Fallback

When the knowledge base has insufficient data, Claude Sonnet's response should acknowledge this. In the MVP, "live web search" means Claude uses its own training knowledge to supplement. In V2, this will be upgraded to actual web search via tool use.

## Rate Limiting

Maximum 20 chat requests per user per hour. Return HTTP 429 with a clear message if exceeded.
