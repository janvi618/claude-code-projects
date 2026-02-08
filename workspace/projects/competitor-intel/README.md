# Competitive Intelligence Network

AI-powered competitive monitoring for General Mills, featuring specialized Product and News analyst agents.

## What It Does

This tool deploys two AI "analysts" that research competitors using real-time web search:

1. **Product Analyst**: Tracks new product launches, innovations, packaging changes, and portfolio moves
2. **News Analyst**: Tracks strategic news, partnerships, earnings highlights, and executive changes

Both agents search the web for current information, then analyze and synthesize findings into actionable intelligence.

## Competitors Tracked

- **Kellogg's / Kellanova** - Cereals, snacks
- **Post Holdings** - Cereals
- **PepsiCo (Quaker)** - Breakfast, oats, snacks
- **Conagra Brands** - Frozen foods, snacks
- **Nestlé** - Frozen, baking, pet food

## Requirements

- Python 3
- Claude API key

## Installation

```bash
pip3 install streamlit anthropic duckduckgo-search --break-system-packages
```

## Running the App

```bash
cd workspace/projects/competitor-intel
streamlit run app.py
```

## How to Use

1. **Enter your API key** in the sidebar
2. **Select a competitor** (or "All Competitors" for overview)
3. **Choose agents** - Product, News, or both
4. **Optionally ask a specific question** (e.g., "Any new cereal launches?")
5. **Click Run Analysis**

### Example Questions

- "What new products has Kellogg's launched recently?"
- "Any acquisitions or partnerships for Conagra?"
- "What's PepsiCo's strategy for the oat category?"
- "Has Post Holdings made any pricing moves?"

## Architecture

```
competitor-intel/
├── app.py            # Streamlit interface
├── agents.py         # Product & News analyst agents
├── competitors.py    # Competitor profiles and context
├── prompts.py        # Agent prompt templates
└── README.md
```

## How It Works

1. **User selects** competitor and agent type
2. **Agent builds** a targeted search query
3. **DuckDuckGo search** retrieves recent public information
4. **Claude analyzes** the search results using specialized prompts
5. **Synthesis agent** (optional) combines both reports into executive brief

## Customization

### Adding Competitors

Edit `competitors.py` to add new entries to the `COMPETITORS` dict. Each needs:
- `name`: Display name
- `ticker`: Stock ticker
- `description`: Company overview
- `key_brands`: List of brands to track
- `overlap_categories`: Where they compete with General Mills
- `watch_for`: Key strategic areas to monitor

### Modifying Agent Behavior

Edit `prompts.py` to change how agents analyze information. Each agent has a specialized prompt that instructs Claude on what to focus on.

## Tips

- **Be specific** with questions to get better search results
- **Run both agents** to get the executive brief synthesis
- Use **"All Competitors"** for a quick landscape scan
- The **search details** expander shows exactly what was searched

## Troubleshooting

**"Search error"**
- DuckDuckGo may rate limit; wait a moment and try again

**"No relevant results"**
- Try rephrasing your question
- Make it more specific to recent events

**Slow responses**
- Each agent makes a web search + Claude call
- "All Competitors" runs multiple analyses (be patient)
