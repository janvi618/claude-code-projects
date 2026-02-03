"""
Strategy Command Center

End-to-end competitive response system:
DETECT → ANALYZE → RESPOND → SIMULATE → LAUNCH

Run with: streamlit run app.py
"""

import streamlit as st
from competitors import COMPANY, COMPETITORS, STAKEHOLDERS
from agents import ThreatAnalyzer, IntelAgent, StrategyAgent, SimulationAgent, ContentAgent
import datetime

# =============================================================================
# PAGE CONFIG
# =============================================================================

st.set_page_config(
    page_title="Strategy Command Center",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# =============================================================================
# CLEAN CSS - Fixed for scrolling and inputs
# =============================================================================

st.markdown("""
<style>
    /* Import Google Font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* Base styling */
    .stApp {
        font-family: 'Inter', sans-serif;
    }

    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}

    /* Header */
    .premium-header {
        background: linear-gradient(135deg, #4f46e5, #7c3aed, #2563eb);
        padding: 2rem;
        border-radius: 16px;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 40px rgba(79, 70, 229, 0.3);
    }

    .premium-header h1 {
        color: white;
        font-size: 2.2rem;
        font-weight: 700;
        margin: 0;
    }

    .premium-header p {
        color: rgba(255,255,255,0.9);
        margin-top: 0.5rem;
        font-size: 1rem;
    }

    .header-badge {
        display: inline-block;
        background: rgba(255,255,255,0.2);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        color: white;
        margin-top: 0.75rem;
    }

    /* Progress bar */
    .progress-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem 0;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 8px;
    }

    .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .progress-circle {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.1rem;
        margin-bottom: 6px;
    }

    .progress-circle-completed {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
    }

    .progress-circle-active {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        transform: scale(1.1);
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    }

    .progress-circle-pending {
        background: #e5e7eb;
        color: #9ca3af;
    }

    .progress-label {
        font-size: 0.7rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
    }

    .progress-line {
        width: 60px;
        height: 3px;
        background: #e5e7eb;
        margin-bottom: 25px;
    }

    .progress-line-completed {
        background: linear-gradient(90deg, #10b981, #6366f1);
    }

    /* Section headers */
    .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 1.5rem 0 1rem 0;
    }

    .section-header h2 {
        font-size: 1.4rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
    }

    .section-badge {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 600;
    }

    /* Cards */
    .glass-card {
        background: #f8fafc;
        border-radius: 12px;
        padding: 1.25rem;
        border: 1px solid #e5e7eb;
        margin-bottom: 1rem;
    }

    /* API container */
    .api-container {
        background: #fef3c7;
        border-radius: 12px;
        padding: 1rem;
        border-left: 4px solid #f59e0b;
        margin-bottom: 1rem;
    }

    .api-text {
        color: #92400e;
        font-weight: 600;
    }

    .api-subtext {
        color: #a16207;
        font-size: 0.9rem;
    }

    /* Dimension grid */
    .dimension-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
        margin: 1rem 0;
    }

    .dimension-card {
        background: white;
        border-radius: 10px;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid #e5e7eb;
    }

    .dimension-icon { font-size: 1.2rem; }
    .dimension-text { font-size: 0.85rem; color: #374151; }

    /* Stakeholder cards */
    .stakeholder-card {
        background: white;
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-top: 3px solid;
        margin-bottom: 1rem;
    }

    .stakeholder-cfo { border-top-color: #10b981; }
    .stakeholder-ceo { border-top-color: #6366f1; }
    .stakeholder-cmo { border-top-color: #8b5cf6; }
    .stakeholder-sales { border-top-color: #f59e0b; }

    .stakeholder-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .stakeholder-title {
        font-weight: 600;
        color: #1f2937;
    }

    /* Success banner */
    .success-banner {
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        border: 1px solid #10b981;
    }

    .success-banner h2 {
        color: #065f46;
        font-size: 1.5rem;
        margin: 0;
    }

    .success-banner p {
        color: #047857;
        margin-top: 0.5rem;
    }

    /* Download section */
    .download-section {
        background: #ede9fe;
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid #c4b5fd;
        margin: 1rem 0;
    }

    .download-title {
        color: #5b21b6;
        font-weight: 600;
    }

    /* Footer */
    .premium-footer {
        text-align: center;
        padding: 2rem;
        margin-top: 2rem;
        border-top: 1px solid #e5e7eb;
        color: #9ca3af;
    }
</style>
""", unsafe_allow_html=True)

# =============================================================================
# SESSION STATE INITIALIZATION
# =============================================================================

if "stage" not in st.session_state:
    st.session_state.stage = 1

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
# HELPER FUNCTIONS
# =============================================================================

def render_header():
    st.markdown("""
    <div class="premium-header">
        <h1>🎯 Strategy Command Center</h1>
        <p>AI-Powered Competitive Intelligence & Response System</p>
        <div class="header-badge">
            <span>⚡</span>
            <span>Powered by Claude AI</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_progress_bar(current_stage):
    stages = [
        ("1", "Detect", "🔍"),
        ("2", "Analyze", "🔬"),
        ("3", "Respond", "💡"),
        ("4", "Simulate", "🎮"),
        ("5", "Launch", "🚀")
    ]

    html = '<div class="progress-container">'

    for i, (num, label, icon) in enumerate(stages):
        stage_num = i + 1

        if stage_num < current_stage:
            circle_class = "progress-circle-completed"
            label_class = ""
            display = "✓"
        elif stage_num == current_stage:
            circle_class = "progress-circle-active"
            label_class = "progress-label-active"
            display = icon
        else:
            circle_class = "progress-circle-pending"
            label_class = ""
            display = num

        html += f'''
        <div class="progress-step">
            <div class="progress-circle {circle_class}">{display}</div>
            <span class="progress-label {label_class}">{label}</span>
        </div>
        '''

        if i < len(stages) - 1:
            line_class = "progress-line-completed" if stage_num < current_stage else ""
            html += f'<div class="progress-line {line_class}"></div>'

    html += '</div>'
    st.markdown(html, unsafe_allow_html=True)

def render_dimension_badges():
    dimensions = [
        ("📰", "Announcements"),
        ("💡", "Patents"),
        ("🤝", "M&A"),
        ("📊", "SEC Filings"),
        ("📈", "Industry"),
        ("💬", "Sentiment"),
        ("⚔️", "History"),
        ("🎤", "Executives"),
    ]

    html = '<div class="dimension-grid">'
    for icon, text in dimensions:
        html += f'''
        <div class="dimension-card">
            <span class="dimension-icon">{icon}</span>
            <span class="dimension-text">{text}</span>
        </div>
        '''
    html += '</div>'
    st.markdown(html, unsafe_allow_html=True)

def generate_html_report():
    """Generate a beautiful HTML report for download."""
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Competitive Response Package - {COMPANY['name']}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #e2e8f0;
            line-height: 1.7;
            padding: 40px;
            min-height: 100vh;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: rgba(255,255,255,0.03);
            border-radius: 24px;
            padding: 48px;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        }}
        .header {{
            text-align: center;
            margin-bottom: 48px;
            padding-bottom: 32px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }}
        .header h1 {{
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #6366f1, #8b5cf6, #0ea5e9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }}
        .header .subtitle {{
            color: #94a3b8;
            font-size: 1.1rem;
        }}
        .header .meta {{
            margin-top: 16px;
            color: #64748b;
            font-size: 0.9rem;
        }}
        .badge {{
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-top: 16px;
        }}
        section {{
            margin-bottom: 40px;
        }}
        h2 {{
            font-size: 1.5rem;
            font-weight: 700;
            color: #f1f5f9;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid rgba(99, 102, 241, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
        }}
        h3 {{
            font-size: 1.2rem;
            font-weight: 600;
            color: #e2e8f0;
            margin: 24px 0 12px 0;
        }}
        h4 {{
            font-size: 1rem;
            font-weight: 600;
            color: #cbd5e1;
            margin: 16px 0 8px 0;
        }}
        p, li {{
            color: #cbd5e1;
            margin-bottom: 12px;
        }}
        ul, ol {{
            padding-left: 24px;
            margin-bottom: 16px;
        }}
        .card {{
            background: rgba(255,255,255,0.02);
            border-radius: 12px;
            padding: 20px;
            margin: 16px 0;
            border: 1px solid rgba(255,255,255,0.05);
        }}
        .threat-box {{
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
            border-left: 4px solid #ef4444;
            padding: 20px;
            border-radius: 0 12px 12px 0;
            margin: 20px 0;
        }}
        .strategy-box {{
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
            border-left: 4px solid #10b981;
            padding: 20px;
            border-radius: 0 12px 12px 0;
            margin: 20px 0;
        }}
        .stakeholder-grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin: 20px 0;
        }}
        .stakeholder-card {{
            background: rgba(255,255,255,0.02);
            border-radius: 12px;
            padding: 16px;
            border-top: 3px solid;
        }}
        .stakeholder-cfo {{ border-color: #10b981; }}
        .stakeholder-ceo {{ border-color: #6366f1; }}
        .stakeholder-cmo {{ border-color: #8b5cf6; }}
        .stakeholder-sales {{ border-color: #f59e0b; }}
        .footer {{
            text-align: center;
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid rgba(255,255,255,0.1);
            color: #64748b;
            font-size: 0.85rem;
        }}
        code {{
            background: rgba(99, 102, 241, 0.2);
            color: #a5b4fc;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
        }}
        pre {{
            background: rgba(0,0,0,0.3);
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 16px 0;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }}
        th {{
            color: #f1f5f9;
            font-weight: 600;
        }}
        @media print {{
            body {{ background: white; color: #1e293b; }}
            .container {{ box-shadow: none; border: none; }}
            h1, h2, h3, h4, p, li {{ color: #1e293b !important; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Competitive Response Package</h1>
            <p class="subtitle">Strategy Command Center | {COMPANY['name']}</p>
            <p class="meta">Generated: {timestamp}</p>
            <span class="badge">AI-Powered Analysis</span>
        </div>

        <section>
            <h2>⚠️ The Threat</h2>
            <div class="threat-box">
                {st.session_state.threat_text}
            </div>
        </section>

        <section>
            <h2>📋 Threat Analysis</h2>
            <div class="card">
                {st.session_state.threat_analysis['analysis'].replace(chr(10), '<br>')}
            </div>
        </section>

        <section>
            <h2>🔬 Intelligence Report</h2>
            <div class="card">
                {st.session_state.intel_report['intel_report'].replace(chr(10), '<br>')}
            </div>
        </section>

        <section>
            <h2>💡 Response Options</h2>
            <div class="card">
                {st.session_state.response_options.replace(chr(10), '<br>')}
            </div>
        </section>

        <section>
            <h2>🎯 Selected Strategy</h2>
            <div class="strategy-box">
                <strong>{st.session_state.selected_response}</strong>
            </div>
        </section>

        <section>
            <h2>🎮 Simulation Results</h2>

            <h3>Stakeholder Reactions</h3>
            <div class="stakeholder-grid">
                <div class="stakeholder-card stakeholder-cfo">
                    <h4>💰 CFO</h4>
                    <p>{st.session_state.simulation_results['stakeholders']['cfo'][:800].replace(chr(10), '<br>')}...</p>
                </div>
                <div class="stakeholder-card stakeholder-ceo">
                    <h4>👔 CEO</h4>
                    <p>{st.session_state.simulation_results['stakeholders']['ceo'][:800].replace(chr(10), '<br>')}...</p>
                </div>
                <div class="stakeholder-card stakeholder-cmo">
                    <h4>📢 CMO</h4>
                    <p>{st.session_state.simulation_results['stakeholders']['cmo'][:800].replace(chr(10), '<br>')}...</p>
                </div>
                <div class="stakeholder-card stakeholder-sales">
                    <h4>📈 VP Sales</h4>
                    <p>{st.session_state.simulation_results['stakeholders']['sales_vp'][:800].replace(chr(10), '<br>')}...</p>
                </div>
            </div>

            <h3>🔴 Red Team Analysis</h3>
            <div class="card">
                {st.session_state.simulation_results['red_team'].replace(chr(10), '<br>')}
            </div>

            <h3>🔮 Scenario Chains</h3>
            <div class="card">
                {st.session_state.simulation_results['scenarios'].replace(chr(10), '<br>')}
            </div>
        </section>

        <section>
            <h2>🚀 Launch Materials</h2>
            <div class="card">
                {st.session_state.launch_materials.replace(chr(10), '<br>')}
            </div>
        </section>

        <div class="footer">
            <p><strong>Strategy Command Center</strong></p>
            <p>DETECT → ANALYZE → RESPOND → SIMULATE → LAUNCH</p>
            <p style="margin-top: 8px;">Powered by Claude AI</p>
        </div>
    </div>
</body>
</html>"""
    return html

def generate_markdown_report():
    """Generate a comprehensive Markdown report."""
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')

    return f"""# 🎯 Competitive Response Package
## Strategy Command Center | {COMPANY['name']}

**Generated:** {timestamp}

---

# ⚠️ THE THREAT

{st.session_state.threat_text}

---

# 📋 THREAT ANALYSIS

{st.session_state.threat_analysis['analysis']}

---

# 🔬 INTELLIGENCE REPORT

{st.session_state.intel_report['intel_report']}

---

# 💡 RESPONSE OPTIONS

{st.session_state.response_options}

---

# 🎯 SELECTED STRATEGY

**{st.session_state.selected_response}**

---

# 🎮 SIMULATION RESULTS

## 👥 Stakeholder Reactions

### 💰 CFO
{st.session_state.simulation_results['stakeholders']['cfo']}

### 👔 CEO
{st.session_state.simulation_results['stakeholders']['ceo']}

### 📢 CMO
{st.session_state.simulation_results['stakeholders']['cmo']}

### 📈 VP Sales
{st.session_state.simulation_results['stakeholders']['sales_vp']}

## 🔴 Red Team Analysis
{st.session_state.simulation_results['red_team']}

## 🔮 Scenario Chains
{st.session_state.simulation_results['scenarios']}

---

# 🚀 LAUNCH MATERIALS

{st.session_state.launch_materials}

---

*Generated by Strategy Command Center | Powered by Claude AI*
"""

# =============================================================================
# SIDEBAR
# =============================================================================

with st.sidebar:
    st.markdown("### ⚙️ Settings")

    model = st.selectbox(
        "AI Model",
        ["claude-sonnet-4-20250514", "claude-opus-4-20250514"],
        index=0,
        key="model_select"
    )

    st.divider()

    st.markdown("### 📍 Progress")
    stages = ["Detect", "Analyze", "Respond", "Simulate", "Launch"]
    for i, stage in enumerate(stages, 1):
        if i < st.session_state.stage:
            st.markdown(f"✅ **{i}. {stage}**")
        elif i == st.session_state.stage:
            st.markdown(f"🔵 **{i}. {stage}** ←")
        else:
            st.markdown(f"⚪ {i}. {stage}")

    st.divider()

    if st.button("🔄 Start Over", use_container_width=True):
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()

    st.divider()
    st.caption(f"🏢 {COMPANY['name']}")

# =============================================================================
# MAIN CONTENT
# =============================================================================

render_header()
render_progress_bar(st.session_state.stage)

# =============================================================================
# STAGE 1: DETECT
# =============================================================================

if st.session_state.stage == 1:

    st.markdown("""
    <div class="api-container">
        <span class="api-icon">🔑</span>
        <div>
            <div class="api-text">API Key Required</div>
            <div class="api-subtext">Enter your Claude API key to enable AI-powered analysis</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns([3, 1])
    with col1:
        api_key = st.text_input(
            "API Key",
            type="password",
            key="api_key_input",
            label_visibility="collapsed",
            placeholder="sk-ant-api..."
        )
    with col2:
        if api_key:
            st.success("✅ Ready")
        else:
            st.warning("Required")

    st.markdown("""
    <div class="section-header">
        <h2>🔍 Describe the Competitive Threat</h2>
        <span class="section-badge">STEP 1</span>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="glass-card">
        <p style="color: rgba(255,255,255,0.7); margin: 0;">
            Paste a news article, press release, or describe a competitive development.
            Be specific about the competitor, product, pricing, and timing for best results.
        </p>
    </div>
    """, unsafe_allow_html=True)

    threat_input = st.text_area(
        "Threat",
        height=180,
        placeholder="Example: Kellogg's announced a new line of high-protein cereals targeting health-conscious consumers...",
        value=st.session_state.threat_text,
        label_visibility="collapsed"
    )

    st.markdown("<br>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 1, 2])
    with col1:
        analyze_btn = st.button("🚀 Analyze Threat", type="primary", disabled=not api_key, use_container_width=True)

    if analyze_btn:
        if not threat_input.strip():
            st.error("⚠️ Please describe the competitive threat first.")
        else:
            st.session_state.threat_text = threat_input

            progress = st.progress(0)
            status = st.empty()

            def update(msg, pct):
                status.info(f"🔄 {msg}")
                progress.progress(pct)

            update("Analyzing threat structure...", 10)
            analyzer = ThreatAnalyzer(api_key, model)
            result = analyzer.analyze(threat_input)
            st.session_state.threat_analysis = result

            update("Running deep research across 8 dimensions...", 25)

            intel = IntelAgent(api_key, model)
            intel_result = intel.research(
                threat_input,
                result.get("competitor_context", ""),
                progress_callback=lambda m: update(m, min(90, 25 + len(m) % 65))
            )
            st.session_state.intel_report = intel_result

            update("Finalizing...", 100)
            status.success("✅ Analysis complete!")

            st.session_state.stage = 2
            st.rerun()

# =============================================================================
# STAGE 2: ANALYZE
# =============================================================================

elif st.session_state.stage == 2:
    api_key = st.text_input("🔑", type="password", key="api_key_input", label_visibility="collapsed")
    model = st.session_state.get("model_select", "claude-sonnet-4-20250514")

    st.markdown("""
    <div class="section-header">
        <h2>📋 Threat Assessment</h2>
        <span class="section-badge">ANALYSIS</span>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(f'<div class="glass-card">{st.session_state.threat_analysis["analysis"]}</div>', unsafe_allow_html=True)

    st.markdown("""
    <div class="section-header">
        <h2>🔬 Deep Research Intelligence</h2>
        <span class="section-badge">8 DIMENSIONS</span>
    </div>
    """, unsafe_allow_html=True)

    render_dimension_badges()

    with st.expander("📂 View Raw Research Data", expanded=False):
        intel_report = st.session_state.intel_report
        search_queries = intel_report.get("search_queries", {})
        search_results = intel_report.get("search_results", {})

        tabs = st.tabs(["📰", "💡", "🤝", "📊", "📈", "💬", "⚔️", "🎤"])
        categories = ["announcements", "patents", "mergers_acquisitions", "sec_filings",
                     "industry_trends", "consumer_sentiment", "competitive_history", "executive_commentary"]

        for tab, cat in zip(tabs, categories):
            with tab:
                if cat in search_queries:
                    queries = search_queries[cat]
                    if isinstance(queries, list):
                        for q in queries[:2]:
                            st.code(q)
                    if cat in search_results:
                        with st.expander("Results"):
                            st.text(search_results[cat].get("results", "")[:2000])

    st.markdown("### 📊 Synthesized Intelligence Report")
    st.markdown(st.session_state.intel_report["intel_report"])

    st.markdown("<br>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 1, 2])
    with col1:
        if st.button("⬅️ Back", use_container_width=True):
            st.session_state.stage = 1
            st.rerun()
    with col2:
        if st.button("Generate Responses ➡️", type="primary", use_container_width=True):
            with st.spinner("🧠 Generating strategic options..."):
                strategy = StrategyAgent(api_key, model)
                st.session_state.response_options = strategy.generate_options(
                    st.session_state.threat_analysis["analysis"],
                    st.session_state.intel_report["intel_report"]
                )
            st.session_state.stage = 3
            st.rerun()

# =============================================================================
# STAGE 3: RESPOND
# =============================================================================

elif st.session_state.stage == 3:
    api_key = st.text_input("🔑", type="password", key="api_key_input", label_visibility="collapsed")
    model = st.session_state.get("model_select", "claude-sonnet-4-20250514")

    st.markdown("""
    <div class="section-header">
        <h2>💡 Strategic Response Options</h2>
        <span class="section-badge">4 OPTIONS</span>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(st.session_state.response_options)
    st.divider()

    st.markdown("### 🎯 Select Response to Simulate")
    response_choice = st.selectbox(
        "Option",
        ["Option 1: HOLD & MONITOR", "Option 2: DEFEND", "Option 3: COUNTER", "Option 4: DISRUPT", "Custom"],
        label_visibility="collapsed"
    )

    selected = response_choice
    if response_choice == "Custom":
        selected = st.text_area("Describe your custom response:", height=120)

    st.markdown("<br>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 1, 2])
    with col1:
        if st.button("⬅️ Back", use_container_width=True):
            st.session_state.stage = 2
            st.rerun()
    with col2:
        if st.button("🎮 Simulate ➡️", type="primary", use_container_width=True):
            st.session_state.selected_response = selected
            threat_context = f"THREAT: {st.session_state.threat_text}\n\nANALYSIS: {st.session_state.threat_analysis['analysis'][:1000]}"
            competitor_context = st.session_state.threat_analysis.get("competitor_context", "")

            sim = SimulationAgent(api_key, model)
            results = {"stakeholders": {}, "red_team": None, "scenarios": None}

            progress = st.progress(0)
            status = st.empty()

            for key, name, pct in [("cfo", "CFO", 20), ("ceo", "CEO", 40), ("cmo", "CMO", 60), ("sales_vp", "VP Sales", 80)]:
                status.info(f"🎭 Simulating {name}...")
                results["stakeholders"][key] = sim.simulate_stakeholder(selected, threat_context, key)
                progress.progress(pct)

            status.info("🔴 Red team analysis...")
            results["red_team"] = sim.red_team(selected, threat_context)
            progress.progress(90)

            status.info("🔮 Scenario chains...")
            results["scenarios"] = sim.scenario_chains(selected, threat_context, competitor_context)
            progress.progress(100)

            st.session_state.simulation_results = results
            st.session_state.stage = 4
            st.rerun()

# =============================================================================
# STAGE 4: SIMULATE
# =============================================================================

elif st.session_state.stage == 4:
    api_key = st.text_input("🔑", type="password", key="api_key_input", label_visibility="collapsed")
    model = st.session_state.get("model_select", "claude-sonnet-4-20250514")

    st.markdown("""
    <div class="section-header">
        <h2>🎮 War Game Simulation</h2>
        <span class="section-badge">RESULTS</span>
    </div>
    """, unsafe_allow_html=True)

    st.info(f"**Strategy:** {st.session_state.selected_response}")

    tab1, tab2, tab3 = st.tabs(["👥 Stakeholders", "🔴 Red Team", "🔮 Scenarios"])

    with tab1:
        col1, col2 = st.columns(2)
        for col, (key, icon, title, css) in zip(
            [col1, col2, col1, col2],
            [("cfo", "💰", "CFO", "cfo"), ("ceo", "👔", "CEO", "ceo"),
             ("cmo", "📢", "CMO", "cmo"), ("sales_vp", "📈", "VP Sales", "sales")]
        ):
            with col:
                st.markdown(f'''<div class="stakeholder-card stakeholder-{css}">
                    <div class="stakeholder-header"><span>{icon}</span><span class="stakeholder-title">{title}</span></div>
                </div>''', unsafe_allow_html=True)
                st.markdown(st.session_state.simulation_results["stakeholders"][key])

    with tab2:
        st.markdown(st.session_state.simulation_results["red_team"])

    with tab3:
        st.markdown(st.session_state.simulation_results["scenarios"])

    st.markdown("<br>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 1, 2])
    with col1:
        if st.button("⬅️ Back", use_container_width=True):
            st.session_state.stage = 3
            st.rerun()
    with col2:
        if st.button("🚀 Generate Materials ➡️", type="primary", use_container_width=True):
            threat_context = f"THREAT: {st.session_state.threat_text}\n\nANALYSIS: {st.session_state.threat_analysis['analysis'][:1000]}"
            sim_summary = f"""STAKEHOLDERS: CFO: {st.session_state.simulation_results['stakeholders']['cfo'][:400]}
CEO: {st.session_state.simulation_results['stakeholders']['ceo'][:400]}
RED TEAM: {st.session_state.simulation_results['red_team'][:600]}"""

            with st.spinner("📝 Generating launch materials..."):
                content = ContentAgent(api_key, model)
                st.session_state.launch_materials = content.generate_materials(
                    st.session_state.selected_response, threat_context, sim_summary
                )
            st.session_state.stage = 5
            st.rerun()

# =============================================================================
# STAGE 5: LAUNCH
# =============================================================================

elif st.session_state.stage == 5:
    st.markdown("""
    <div class="success-banner">
        <h2>🎉 Your Response Package is Ready!</h2>
        <p>All materials have been generated and are ready for download.</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    st.markdown("""
    <div class="section-header">
        <h2>📥 Download Your Package</h2>
        <span class="section-badge">EXPORT</span>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="download-section">
        <div class="download-title">📦 Choose your format</div>
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)

    with col1:
        st.download_button(
            "📄 Download Markdown",
            generate_markdown_report(),
            f"competitive_response_{datetime.datetime.now().strftime('%Y%m%d')}.md",
            "text/markdown",
            use_container_width=True
        )

    with col2:
        st.download_button(
            "🌐 Download HTML",
            generate_html_report(),
            f"competitive_response_{datetime.datetime.now().strftime('%Y%m%d')}.html",
            "text/html",
            use_container_width=True
        )

    with col3:
        # Plain text version
        plain_text = f"""COMPETITIVE RESPONSE PACKAGE
{COMPANY['name']}
Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}

{'='*60}
THE THREAT
{'='*60}
{st.session_state.threat_text}

{'='*60}
SELECTED STRATEGY
{'='*60}
{st.session_state.selected_response}

{'='*60}
LAUNCH MATERIALS
{'='*60}
{st.session_state.launch_materials}
"""
        st.download_button(
            "📝 Download Text",
            plain_text,
            f"competitive_response_{datetime.datetime.now().strftime('%Y%m%d')}.txt",
            "text/plain",
            use_container_width=True
        )

    st.markdown("""
    <div class="section-header">
        <h2>🚀 Launch Materials</h2>
        <span class="section-badge">PREVIEW</span>
    </div>
    """, unsafe_allow_html=True)

    st.info(f"**Strategy:** {st.session_state.selected_response}")
    st.markdown(st.session_state.launch_materials)

    st.markdown("<br>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 1, 2])
    with col1:
        if st.button("⬅️ Back", use_container_width=True):
            st.session_state.stage = 4
            st.rerun()
    with col2:
        if st.button("🔄 New Analysis", use_container_width=True):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()

# =============================================================================
# FOOTER
# =============================================================================

st.markdown("""
<div class="premium-footer">
    <strong>Strategy Command Center</strong><br>
    DETECT → ANALYZE → RESPOND → SIMULATE → LAUNCH<br>
    <span style="font-size: 0.8rem; margin-top: 8px; display: block;">Powered by Claude AI</span>
</div>
""", unsafe_allow_html=True)
