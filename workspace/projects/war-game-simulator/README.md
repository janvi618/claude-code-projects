# Competitive War Game Simulator

A web application for stress-testing competitive strategies before committing to them.

## What It Does

This tool helps you simulate competitive scenarios by providing three types of analysis:

1. **Scenario Modeling**: Generates "if-then" scenario chains showing how your move might trigger competitor responses and market effects

2. **Stakeholder Simulation**: Shows how key executives (CFO, CEO, VP Sales, CMO) would react to your strategy based on their typical priorities and concerns

3. **Red Team Analysis**: Argues against your strategy to find weaknesses, blind spots, and risks you may have missed

## Requirements

- Python 3
- Claude API key (get one at [console.anthropic.com](https://console.anthropic.com))

## Installation

```bash
# Install dependencies
pip3 install streamlit anthropic --break-system-packages
```

## Running the App

```bash
# Navigate to the project folder
cd workspace/projects/war-game-simulator

# Run the app
streamlit run app.py
```

The app will open in your browser (usually at http://localhost:8501).

## How to Use

1. **Enter your API key** in the sidebar (it's stored only for your session)

2. **Describe your situation**: What's the competitive context? What happened? Who are the key players?

3. **Enter your strategy**: What are you planning to do in response?

4. **Click "Run Simulation"** and review the three tabs of analysis

5. **Iterate**: Use the insights to refine your strategy, then run again

## Example Input

**Situation:**
> Our main competitor just announced a 20% price cut on their flagship product, which directly competes with our premium offering. They're positioning this as "democratizing" the market. We have 45% market share, they have 30%.

**Strategy:**
> We plan to hold our price but launch a new "Essentials" tier at a 25% lower price point with fewer features. This protects our premium brand while giving price-sensitive customers an option.

## File Structure

```
war-game-simulator/
├── app.py          # Main Streamlit application
├── prompts.py      # AI prompt templates for each analysis type
├── personas.py     # Stakeholder persona definitions
└── README.md       # This file
```

## Customization

### Adding New Personas

Edit `personas.py` to add new stakeholder types. Each persona needs:
- `name`: Display name
- `title`: Short title
- `focus`: What they care about most
- `cares_about`: List of priorities
- `evaluates_by`: Questions they ask
- `typical_objections`: Common pushback

### Modifying Prompts

Edit `prompts.py` to change how Claude analyzes your strategy. Each function returns a prompt string that instructs Claude what to do.

## Tips for Better Results

1. **Be specific**: Include competitor names, market share numbers, customer feedback
2. **Provide context**: What's the history? What constraints do you face?
3. **State your goal**: What does success look like?
4. **Iterate**: Run multiple simulations as you refine your thinking

## Troubleshooting

**"Error running analysis"**
- Check that your API key is correct
- Ensure you have API credits available

**App won't start**
- Make sure you're in the right directory
- Try: `python3 -m streamlit run app.py`

**Slow responses**
- Try the Sonnet model (faster than Opus)
- Reduce the complexity of your input
