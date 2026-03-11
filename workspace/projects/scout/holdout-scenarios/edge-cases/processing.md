# Edge Case: No Intelligence Items in 24 Hours

## Scenario
All sources fail to produce new content for 24 hours (e.g., holiday weekend). The brief scheduler runs at 6:30 AM CT. It should detect that there are fewer than 3 items with relevance >= 50 in the past 24 hours. It should generate a shorter-than-usual brief acknowledging the quiet period, OR skip generation and send a notification email explaining no brief was generated due to low activity. It must not crash, generate an empty brief, or silently fail.

# Edge Case: Extremely Long Article

## Scenario
A source publishes a 15,000-word article (e.g., a long-form investigative piece). The extraction pipeline receives this content. It should truncate the content to fit within the LLM's context window (or use the first N characters) rather than failing. The extracted item should still have a valid headline, summary, and relevance score. Processing time for this single item should not exceed 60 seconds.

# Edge Case: Duplicate Content Across Sources

## Scenario
The same press release appears on Food Dive, Food Navigator, and the company's own newsroom. The collection pipeline fetches all three. The deduplication logic should detect that the core content is substantially similar (even if not byte-identical due to different formatting) and store only one canonical version, or store all three but deduplicate at the intelligence_items level. The daily brief should not mention the same development three times.
