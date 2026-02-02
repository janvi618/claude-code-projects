"""
Strategy Command Center

End-to-end competitive response system:
DETECT → ANALYZE → RESPOND → SIMULATE → LAUNCH

Run with: streamlit run app.py
"""

import streamlit as st
from competitors import COMPANY, COMPETITORS, STAKEHOLDERS
from agents import ThreatAnalyzer, IntelAgent, StrategyAgent, SimulationAgent, ContentAgent

# =============================================================================
# PAGE CONFIG
# =============================================================================

st.set_page_config(
    page_title="Strategy Command Center",
    page_icon="🎯",
    layout="wide"
)

# =============================================================================
# SESSION STATE INITIALIZATION
# =============================================================================

if "stage" not in st.session_state:
    st.session_state.stage = 1  # Start at stage 1

if "threat_text" not in st.session_state:
    st.session_state.threat_text = ""

if "threat_analysis" not in st.session_state:
    st.session_state.threat_analysis = None

if "intel_report" not in st.session_state:
    st.session_state.intel_report = None

if "response_options" not in st.session_state:
    st.session_state.response_options = None

if "selected_response" not in st.session_state:
    st.session_state.selected_response = ""

if "simulation_results" not in st.session_state:
    st.session_state.simulation_results = None

if "launch_materials" not in st.session_state:
    st.session_state.launch_materials = None

# =============================================================================
# SIDEBAR
# =============================================================================

with st.sidebar:
    st.title("⚙️ Settings")

    api_key = st.text_input("Claude API Key", type="password")
    if api_key:
        st.success("✓ API key entered")
    else:
        st.warning("⚠️ Enter API key")

    model = st.selectbox(
        "Model",
        ["claude-sonnet-4-20250514", "claude-opus-4-20250514"],
        index=0
    )

    st.divider()

    # Progress indicator
    st.subheader("📍 Progress")
    stages = ["1. Detect", "2. Analyze", "3. Respond", "4. Simulate", "5. Launch"]
    for i, stage in enumerate(stages, 1):
        if i < st.session_state.stage:
            st.markdown(f"✅ {stage}")
        elif i == st.session_state.stage:
            st.markdown(f"**➡️ {stage}**")
        else:
            st.markdown(f"⬜ {stage}")

    st.divider()

    if st.button("🔄 Start Over"):
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()

    st.divider()
    st.caption(f"Company: {COMPANY['name']}")

# =============================================================================
# MAIN CONTENT
# =============================================================================

st.title("🎯 Strategy Command Center")
st.markdown("*End-to-end competitive response: Detect → Analyze → Respond → Simulate → Launch*")

# =============================================================================
# STAGE 1: DETECT
# =============================================================================

if st.session_state.stage == 1:
    st.header("1️⃣ DETECT: What's the Competitive Threat?")

    st.markdown("""
    Paste a news article, announcement, or describe a competitive development.
    The system will analyze the threat and research context.
    """)

    threat_input = st.text_area(
        "Describe the competitive threat or paste news:",
        height=200,
        placeholder="""Example:
Kellogg's announced today they are launching a new line of high-protein cereals
targeting health-conscious consumers. The "Kellogg's Protein+" line will include
three SKUs with 15g of protein per serving, priced at $5.99. They're planning
a major marketing push starting Q2 with celebrity athlete endorsements.""",
        value=st.session_state.threat_text
    )

    col1, col2 = st.columns([1, 4])
    with col1:
        if st.button("🔍 Analyze Threat", type="primary", disabled=not api_key):
            if not threat_input.strip():
                st.error("Please describe the competitive threat.")
            else:
                st.session_state.threat_text = threat_input

                with st.spinner("Analyzing threat..."):
                    analyzer = ThreatAnalyzer(api_key, model)
                    result = analyzer.analyze(threat_input)
                    st.session_state.threat_analysis = result

                with st.spinner("Researching context..."):
                    intel = IntelAgent(api_key, model)
                    intel_result = intel.research(
                        threat_input,
                        result.get("competitor_context", "")
                    )
                    st.session_state.intel_report = intel_result

                st.session_state.stage = 2
                st.rerun()

# =============================================================================
# STAGE 2: ANALYZE
# =============================================================================

elif st.session_state.stage == 2:
    st.header("2️⃣ ANALYZE: Understanding the Threat")

    # Show threat analysis
    st.subheader("Threat Assessment")
    st.markdown(st.session_state.threat_analysis["analysis"])

    st.divider()

    # Show intel report
    st.subheader("Intelligence Report")
    with st.expander("View Research Details", expanded=False):
        st.code(st.session_state.intel_report["search_query"])
    st.markdown(st.session_state.intel_report["intel_report"])

    st.divider()

    col1, col2, col3 = st.columns([1, 1, 3])
    with col1:
        if st.button("⬅️ Back"):
            st.session_state.stage = 1
            st.rerun()
    with col2:
        if st.button("Generate Response Options ➡️", type="primary"):
            with st.spinner("Generating strategic options..."):
                strategy = StrategyAgent(api_key, model)
                options = strategy.generate_options(
                    st.session_state.threat_analysis["analysis"],
                    st.session_state.intel_report["intel_report"]
                )
                st.session_state.response_options = options
            st.session_state.stage = 3
            st.rerun()

# =============================================================================
# STAGE 3: RESPOND
# =============================================================================

elif st.session_state.stage == 3:
    st.header("3️⃣ RESPOND: Choose Your Strategy")

    st.markdown("Review the options below, then select one to simulate.")

    st.markdown(st.session_state.response_options)

    st.divider()

    st.subheader("Select a Response to Simulate")

    response_choice = st.selectbox(
        "Which option do you want to war-game?",
        [
            "Option 1: HOLD & MONITOR",
            "Option 2: DEFEND",
            "Option 3: COUNTER",
            "Option 4: DISRUPT",
            "Custom response (enter below)"
        ]
    )

    if response_choice == "Custom response (enter below)":
        custom_response = st.text_area(
            "Describe your custom response strategy:",
            height=150
        )
        selected = custom_response
    else:
        selected = response_choice

    st.divider()

    col1, col2, col3 = st.columns([1, 1, 3])
    with col1:
        if st.button("⬅️ Back"):
            st.session_state.stage = 2
            st.rerun()
    with col2:
        if st.button("Simulate This Response ➡️", type="primary"):
            st.session_state.selected_response = selected

            # Build threat context for simulation
            threat_context = f"""
THREAT: {st.session_state.threat_text}

ANALYSIS: {st.session_state.threat_analysis['analysis'][:1000]}
"""
            competitor_context = st.session_state.threat_analysis.get("competitor_context", "")

            sim = SimulationAgent(api_key, model)

            results = {
                "stakeholders": {},
                "red_team": None,
                "scenarios": None
            }

            # Simulate stakeholders
            with st.spinner("Simulating CFO reaction..."):
                results["stakeholders"]["cfo"] = sim.simulate_stakeholder(
                    selected, threat_context, "cfo"
                )
            with st.spinner("Simulating CEO reaction..."):
                results["stakeholders"]["ceo"] = sim.simulate_stakeholder(
                    selected, threat_context, "ceo"
                )
            with st.spinner("Simulating CMO reaction..."):
                results["stakeholders"]["cmo"] = sim.simulate_stakeholder(
                    selected, threat_context, "cmo"
                )
            with st.spinner("Simulating VP Sales reaction..."):
                results["stakeholders"]["sales_vp"] = sim.simulate_stakeholder(
                    selected, threat_context, "sales_vp"
                )

            # Red team
            with st.spinner("Running red team analysis..."):
                results["red_team"] = sim.red_team(selected, threat_context)

            # Scenario chains
            with st.spinner("Generating scenario chains..."):
                results["scenarios"] = sim.scenario_chains(
                    selected, threat_context, competitor_context
                )

            st.session_state.simulation_results = results
            st.session_state.stage = 4
            st.rerun()

# =============================================================================
# STAGE 4: SIMULATE
# =============================================================================

elif st.session_state.stage == 4:
    st.header("4️⃣ SIMULATE: War Gaming Your Response")

    st.markdown(f"**Selected Response**: {st.session_state.selected_response}")

    st.divider()

    # Tabs for different simulation views
    tab1, tab2, tab3 = st.tabs([
        "👥 Stakeholder Reactions",
        "🔴 Red Team Critique",
        "🔮 Scenario Chains"
    ])

    with tab1:
        st.subheader("How Key Stakeholders React")

        col1, col2 = st.columns(2)

        with col1:
            with st.expander("**CFO**", expanded=True):
                st.markdown(st.session_state.simulation_results["stakeholders"]["cfo"])

            with st.expander("**CMO**", expanded=True):
                st.markdown(st.session_state.simulation_results["stakeholders"]["cmo"])

        with col2:
            with st.expander("**CEO**", expanded=True):
                st.markdown(st.session_state.simulation_results["stakeholders"]["ceo"])

            with st.expander("**VP Sales**", expanded=True):
                st.markdown(st.session_state.simulation_results["stakeholders"]["sales_vp"])

    with tab2:
        st.subheader("Red Team Analysis")
        st.markdown(st.session_state.simulation_results["red_team"])

    with tab3:
        st.subheader("If-Then Scenario Chains")
        st.markdown(st.session_state.simulation_results["scenarios"])

    st.divider()

    col1, col2, col3 = st.columns([1, 1, 3])
    with col1:
        if st.button("⬅️ Back to Options"):
            st.session_state.stage = 3
            st.rerun()
    with col2:
        if st.button("Generate Launch Materials ➡️", type="primary"):
            threat_context = f"""
THREAT: {st.session_state.threat_text}

ANALYSIS: {st.session_state.threat_analysis['analysis'][:1000]}
"""
            # Combine simulation results for context
            sim_summary = f"""
STAKEHOLDER REACTIONS:
- CFO: {st.session_state.simulation_results['stakeholders']['cfo'][:500]}
- CEO: {st.session_state.simulation_results['stakeholders']['ceo'][:500]}

RED TEAM CONCERNS:
{st.session_state.simulation_results['red_team'][:800]}

SCENARIOS:
{st.session_state.simulation_results['scenarios'][:800]}
"""

            with st.spinner("Generating launch materials..."):
                content = ContentAgent(api_key, model)
                materials = content.generate_materials(
                    st.session_state.selected_response,
                    threat_context,
                    sim_summary
                )
                st.session_state.launch_materials = materials

            st.session_state.stage = 5
            st.rerun()

# =============================================================================
# STAGE 5: LAUNCH
# =============================================================================

elif st.session_state.stage == 5:
    st.header("5️⃣ LAUNCH: Ready-to-Use Materials")

    st.success("✅ Your competitive response package is ready!")

    st.markdown(f"**Response Strategy**: {st.session_state.selected_response}")

    st.divider()

    st.markdown(st.session_state.launch_materials)

    st.divider()

    # Download option
    st.download_button(
        label="📥 Download Full Package (Markdown)",
        data=f"""# Competitive Response Package
## General Mills Strategy Command Center

Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}

---

# THE THREAT

{st.session_state.threat_text}

---

# THREAT ANALYSIS

{st.session_state.threat_analysis['analysis']}

---

# INTELLIGENCE REPORT

{st.session_state.intel_report['intel_report']}

---

# RESPONSE OPTIONS CONSIDERED

{st.session_state.response_options}

---

# SELECTED RESPONSE

{st.session_state.selected_response}

---

# SIMULATION RESULTS

## Stakeholder Reactions

### CFO
{st.session_state.simulation_results['stakeholders']['cfo']}

### CEO
{st.session_state.simulation_results['stakeholders']['ceo']}

### CMO
{st.session_state.simulation_results['stakeholders']['cmo']}

### VP Sales
{st.session_state.simulation_results['stakeholders']['sales_vp']}

## Red Team Analysis
{st.session_state.simulation_results['red_team']}

## Scenario Chains
{st.session_state.simulation_results['scenarios']}

---

# LAUNCH MATERIALS

{st.session_state.launch_materials}
""",
        file_name="competitive_response_package.md",
        mime="text/markdown"
    )

    col1, col2, col3 = st.columns([1, 1, 3])
    with col1:
        if st.button("⬅️ Back to Simulation"):
            st.session_state.stage = 4
            st.rerun()
    with col2:
        if st.button("🔄 Start New Analysis"):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()

# =============================================================================
# FOOTER
# =============================================================================

st.divider()
st.markdown("""
<div style='text-align: center; color: gray; font-size: 0.8em;'>
Strategy Command Center | General Mills<br>
DETECT → ANALYZE → RESPOND → SIMULATE → LAUNCH
</div>
""", unsafe_allow_html=True)
