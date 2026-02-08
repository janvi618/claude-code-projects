---
name: timeline
description: Generate a chronological timeline from documents
---

# Generate Timeline

Create a chronological timeline of events from a collection of documents.

## Usage

```
/timeline [folder-path]
```

If no folder path is provided, defaults to `docs/`.

## What This Does

This command invokes the `timeline-generator` skill to:

1. Scan all documents for dates and events
2. Extract explicit and implicit timing references
3. Categorize events (announcements, launches, problems, etc.)
4. Build a chronological sequence
5. Identify turning points and patterns

## Examples

```
/timeline
```
Creates a timeline from the Meridian scenario documents.

```
/timeline workspace/projects/competitor-research/
```
Creates a timeline from your own research collection.

## Output

You'll receive:
- Chronological list of dated events with sources
- Event type indicators (📢 announcements, 🚀 launches, ⚠️ problems)
- Turning points analysis
- Patterns observed across time
- Gaps in the documented record

$ARGUMENTS
folder_path: Path to folder containing documents (default: docs/)
