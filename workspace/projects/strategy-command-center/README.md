# Strategy Command Center

End-to-end competitive response system for General Mills.

## The Full Workflow

```
DETECT → ANALYZE → RESPOND → SIMULATE → LAUNCH
```

| Stage | What Happens |
|-------|--------------|
| **1. DETECT** | Enter a competitive threat (paste news or describe) |
| **2. ANALYZE** | AI analyzes the threat + researches context |
| **3. RESPOND** | Generate 4 strategic response options |
| **4. SIMULATE** | War-game chosen response (stakeholders + red team + scenarios) |
| **5. LAUNCH** | Generate ready-to-use materials (talking points, messaging, checklists) |

## What You Get

By the end, you have a complete response package:
- Executive summary
- Internal talking points
- External messaging framework
- Sales team brief
- Action checklist
- Success metrics

All downloadable as a single Markdown file.

## Requirements

- Python 3
- Claude API key

## Installation

```bash
pip3 install streamlit anthropic duckduckgo-search --break-system-packages
```

## Running the App

```bash
cd workspace/projects/strategy-command-center
streamlit run app.py
```

## How to Use

1. **Enter your API key** in the sidebar
2. **Paste a competitive threat** (news article, announcement, or description)
3. **Click through each stage**, reviewing and refining as you go
4. **Download the complete package** at the end

## Example Threat to Try

```
Kellogg's announced today they are launching a new line of high-protein cereals
targeting health-conscious consumers. The "Kellogg's Protein+" line will include
three SKUs with 15g of protein per serving, priced at $5.99. They're planning
a major marketing push starting Q2 with celebrity athlete endorsements.
```

## Architecture

```
strategy-command-center/
├── app.py            # Main Streamlit app (wizard-style flow)
├── agents.py         # 5 specialized agents
├── competitors.py    # Competitor profiles
├── prompts.py        # Prompt templates for each agent
└── README.md
```

## The Agents

| Agent | Purpose |
|-------|---------|
| **ThreatAnalyzer** | Structures and assesses the competitive threat |
| **IntelAgent** | Researches context via web search |
| **StrategyAgent** | Generates 4 response options (hold, defend, counter, disrupt) |
| **SimulationAgent** | Simulates stakeholders + red team + scenario chains |
| **ContentAgent** | Generates launch-ready materials |

## Competitors Tracked

- Kellogg's / Kellanova
- Post Holdings
- PepsiCo (Quaker)
- Conagra Brands
- Nestlé

## Stakeholders Simulated

- CFO (financial focus)
- CEO (strategic focus)
- CMO (brand focus)
- VP Sales (revenue focus)

## Tips

- **Be specific** when describing the threat - include details like pricing, timing, channels
- **Review each stage** before moving on - the analysis builds on previous stages
- **Use the red team feedback** to strengthen your chosen response
- **Download the package** to share with your team

## Customization

### Adding Competitors
Edit `competitors.py` to add new entries.

### Changing Stakeholders
Edit the `STAKEHOLDERS` dict in `competitors.py`.

### Modifying Prompts
Edit `prompts.py` to change how each agent analyzes and generates content.
