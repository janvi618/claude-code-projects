"""
Competitive War Game Simulator

A Streamlit web app for simulating competitive scenarios, testing strategies
against stakeholder personas, and stress-testing decisions with a red team.

Run with: streamlit run app.py
"""

import streamlit as st
from anthropic import Anthropic

# Import our local modules
from prompts import scenario_prompt, stakeholder_prompt, redteam_prompt
from personas import get_all_personas, get_persona

# =============================================================================
# PAGE CONFIGURATION
# =============================================================================

st.set_page_config(
    page_title="War Game Simulator",
    page_icon="🎯",
    layout="wide"
)

# =============================================================================
# SIDEBAR - API KEY INPUT
# =============================================================================

with st.sidebar:
    st.title("⚙️ Settings")

    # API key input - stored in session state for persistence
    api_key = st.text_input(
        "Claude API Key",
        type="password",
        help="Enter your Anthropic API key. Get one at console.anthropic.com",
        key="api_key_input"
    )

    if api_key:
        st.success("✓ API key entered")
    else:
        st.warning("⚠️ Enter your API key to run simulations")

    st.divider()

    # Model selection
    model = st.selectbox(
        "Claude Model",
        options=["claude-sonnet-4-20250514", "claude-opus-4-20250514"],
        index=0,
        help="Sonnet is faster and cheaper. Opus is more thorough."
    )

    st.divider()

    # Instructions
    st.markdown("""
    ### How to Use
    1. Enter your API key above
    2. Describe your competitive situation
    3. Enter your proposed strategy
    4. Click **Run Simulation**
    5. Review results in each tab

    ### Tips
    - Be specific about competitors
    - Include relevant context
    - Iterate based on feedback
    """)

# =============================================================================
# MAIN CONTENT
# =============================================================================

st.title("🎯 Competitive War Game Simulator")
st.markdown("""
Test your competitive strategy against multiple perspectives before committing.
Get scenario analysis, stakeholder reactions, and red team critique.
""")

# Input section
st.header("📝 Your Situation")

col1, col2 = st.columns(2)

with col1:
    situation = st.text_area(
        "Describe the competitive situation",
        height=200,
        placeholder="""Example:
Our main competitor just announced a 20% price cut on their flagship product,
which directly competes with our premium offering. They're positioning this as
"democratizing" the market. We have 45% market share, they have 30%. Our
product has better features but is priced 35% higher. Initial customer
reactions are mixed—some are asking us to match, others value our quality.""",
        help="Include: what happened, key players, market context, stakes"
    )

with col2:
    strategy = st.text_area(
        "Your proposed response/strategy",
        height=200,
        placeholder="""Example:
We plan to hold our price but launch a new "Essentials" tier at a 25% lower
price point with fewer features. This protects our premium brand while giving
price-sensitive customers an option. We'll emphasize total cost of ownership
in our messaging, showing that our higher upfront cost leads to lower
long-term costs.""",
        help="What are you planning to do? Be specific about the approach."
    )

# Run simulation button
st.divider()

if st.button("🚀 Run Simulation", type="primary", use_container_width=True):

    # Validation
    if not api_key:
        st.error("Please enter your Claude API key in the sidebar.")
    elif not situation.strip():
        st.error("Please describe your competitive situation.")
    elif not strategy.strip():
        st.error("Please enter your proposed strategy.")
    else:
        # Initialize Claude client
        client = Anthropic(api_key=api_key)

        # Create tabs for results
        tab1, tab2, tab3 = st.tabs([
            "📊 Scenario Analysis",
            "👥 Stakeholder Reactions",
            "🔴 Red Team Critique"
        ])

        # -----------------------------------------------------------------
        # TAB 1: SCENARIO ANALYSIS
        # -----------------------------------------------------------------
        with tab1:
            st.subheader("Scenario Modeling: Move & Counter-Move")
            with st.spinner("Analyzing competitive scenarios..."):
                try:
                    response = client.messages.create(
                        model=model,
                        max_tokens=2000,
                        messages=[{
                            "role": "user",
                            "content": scenario_prompt(situation, strategy)
                        }]
                    )
                    st.markdown(response.content[0].text)
                except Exception as e:
                    st.error(f"Error running scenario analysis: {str(e)}")

        # -----------------------------------------------------------------
        # TAB 2: STAKEHOLDER REACTIONS
        # -----------------------------------------------------------------
        with tab2:
            st.subheader("Stakeholder Reactions")
            st.markdown("*How key executives would respond to this strategy*")

            personas = get_all_personas()

            # Create columns for personas
            persona_cols = st.columns(2)

            for idx, (key, persona) in enumerate(personas.items()):
                col = persona_cols[idx % 2]

                with col:
                    with st.expander(f"**{persona['name']}**", expanded=True):
                        with st.spinner(f"Simulating {persona['title']}..."):
                            try:
                                response = client.messages.create(
                                    model=model,
                                    max_tokens=1000,
                                    messages=[{
                                        "role": "user",
                                        "content": stakeholder_prompt(
                                            situation, strategy, persona
                                        )
                                    }]
                                )
                                st.markdown(response.content[0].text)
                            except Exception as e:
                                st.error(f"Error: {str(e)}")

        # -----------------------------------------------------------------
        # TAB 3: RED TEAM CRITIQUE
        # -----------------------------------------------------------------
        with tab3:
            st.subheader("Red Team Analysis")
            st.markdown("*Constructive criticism to strengthen your strategy*")

            with st.spinner("Running red team analysis..."):
                try:
                    response = client.messages.create(
                        model=model,
                        max_tokens=2000,
                        messages=[{
                            "role": "user",
                            "content": redteam_prompt(situation, strategy)
                        }]
                    )
                    st.markdown(response.content[0].text)
                except Exception as e:
                    st.error(f"Error running red team analysis: {str(e)}")

        # Success message
        st.divider()
        st.success("✅ Simulation complete! Review each tab for insights.")

# =============================================================================
# FOOTER
# =============================================================================

st.divider()
st.markdown("""
<div style='text-align: center; color: gray; font-size: 0.8em;'>
War Game Simulator | Built with Claude API + Streamlit<br>
Use insights to strengthen your strategy before committing.
</div>
""", unsafe_allow_html=True)
