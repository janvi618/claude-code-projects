"""
Competitive Intelligence Network for General Mills

A Streamlit app that deploys specialized AI analysts to monitor
competitor product moves and strategic news.

Run with: streamlit run app.py
"""

import streamlit as st
from anthropic import Anthropic

from competitors import COMPETITORS, COMPANY, get_competitor_context
from agents import ProductAnalyst, NewsAnalyst, IntelligenceSynthesizer

# =============================================================================
# PAGE CONFIGURATION
# =============================================================================

st.set_page_config(
    page_title="Competitive Intel | General Mills",
    page_icon="🔍",
    layout="wide"
)

# =============================================================================
# SIDEBAR
# =============================================================================

with st.sidebar:
    st.title("⚙️ Settings")

    # API key
    api_key = st.text_input(
        "Claude API Key",
        type="password",
        help="Enter your Anthropic API key"
    )

    if api_key:
        st.success("✓ API key entered")
    else:
        st.warning("⚠️ Enter API key to run analysis")

    st.divider()

    # Model selection
    model = st.selectbox(
        "Model",
        ["claude-sonnet-4-20250514", "claude-opus-4-20250514"],
        index=0
    )

    st.divider()

    # Company context
    st.subheader("📊 Your Company")
    st.markdown(f"**{COMPANY['name']}**")
    st.caption(COMPANY['description'])

    st.divider()

    st.markdown("""
    ### How to Use
    1. Select a competitor
    2. Choose an agent (Product or News)
    3. Enter a question or use defaults
    4. Click **Run Analysis**

    ### Agents
    - **Product**: Tracks launches, innovations, packaging
    - **News**: Tracks strategy, partnerships, financials
    """)

# =============================================================================
# MAIN CONTENT
# =============================================================================

st.title("🔍 Competitive Intelligence Network")
st.markdown("*AI-powered competitive monitoring for General Mills*")

# Competitor selection
st.header("1. Select Competitor")

competitor_options = {v["name"]: k for k, v in COMPETITORS.items()}
competitor_options["All Competitors (Overview)"] = "all"

selected_display = st.selectbox(
    "Which competitor do you want to analyze?",
    options=list(competitor_options.keys())
)
selected_competitor = competitor_options[selected_display]

# Show competitor context if single competitor selected
if selected_competitor != "all":
    with st.expander("View competitor profile", expanded=False):
        comp = COMPETITORS[selected_competitor]
        st.markdown(f"**{comp['name']}** ({comp['ticker']})")
        st.markdown(f"*{comp['description']}*")
        st.markdown(f"**Key Brands**: {', '.join(comp['key_brands'])}")
        st.markdown(f"**Overlap with GM**: {', '.join(comp['overlap_categories'])}")
        st.markdown(f"**Watch For**: {', '.join(comp['watch_for'])}")

# Agent selection
st.header("2. Choose Agent")

col1, col2 = st.columns(2)

with col1:
    product_selected = st.checkbox("🏷️ **Product Analyst**", value=True)
    st.caption("New launches, innovations, packaging changes")

with col2:
    news_selected = st.checkbox("📰 **News Analyst**", value=True)
    st.caption("Strategy, partnerships, earnings, exec moves")

# Query input
st.header("3. Your Question (Optional)")

query = st.text_input(
    "Ask a specific question, or leave blank for general update",
    placeholder="e.g., What new cereal products have they launched? Any recent acquisitions?"
)

# Run button
st.divider()

if st.button("🚀 Run Analysis", type="primary", use_container_width=True):

    # Validation
    if not api_key:
        st.error("Please enter your Claude API key in the sidebar.")
    elif not product_selected and not news_selected:
        st.error("Please select at least one agent.")
    elif selected_competitor == "all":
        st.info("Running analysis across all competitors...")

        # Loop through all competitors
        for comp_key, comp_data in COMPETITORS.items():
            st.subheader(f"📊 {comp_data['name']}")

            tabs = []
            if product_selected:
                tabs.append("Product Intel")
            if news_selected:
                tabs.append("News Intel")
            if product_selected and news_selected:
                tabs.append("Executive Brief")

            tab_objects = st.tabs(tabs)
            tab_idx = 0

            product_result = None
            news_result = None

            if product_selected:
                with tab_objects[tab_idx]:
                    with st.spinner(f"Product Analyst researching {comp_data['name']}..."):
                        try:
                            agent = ProductAnalyst(api_key, model)
                            product_result = agent.analyze(comp_key, query if query else None)
                            st.markdown(product_result["analysis"])
                            with st.expander("View search details"):
                                st.code(product_result["search_query"])
                        except Exception as e:
                            st.error(f"Error: {str(e)}")
                tab_idx += 1

            if news_selected:
                with tab_objects[tab_idx]:
                    with st.spinner(f"News Analyst researching {comp_data['name']}..."):
                        try:
                            agent = NewsAnalyst(api_key, model)
                            news_result = agent.analyze(comp_key, query if query else None)
                            st.markdown(news_result["analysis"])
                            with st.expander("View search details"):
                                st.code(news_result["search_query"])
                        except Exception as e:
                            st.error(f"Error: {str(e)}")
                tab_idx += 1

            if product_selected and news_selected and product_result and news_result:
                with tab_objects[tab_idx]:
                    with st.spinner("Synthesizing executive brief..."):
                        try:
                            synthesizer = IntelligenceSynthesizer(api_key, model)
                            brief = synthesizer.synthesize(
                                comp_data['name'],
                                product_result["analysis"],
                                news_result["analysis"]
                            )
                            st.markdown(brief)
                        except Exception as e:
                            st.error(f"Error: {str(e)}")

            st.divider()

    else:
        # Single competitor analysis
        comp_data = COMPETITORS[selected_competitor]

        tabs = []
        if product_selected:
            tabs.append("🏷️ Product Intel")
        if news_selected:
            tabs.append("📰 News Intel")
        if product_selected and news_selected:
            tabs.append("📋 Executive Brief")

        tab_objects = st.tabs(tabs)
        tab_idx = 0

        product_result = None
        news_result = None

        if product_selected:
            with tab_objects[tab_idx]:
                st.subheader(f"Product Intelligence: {comp_data['name']}")
                with st.spinner("Product Analyst is researching..."):
                    try:
                        agent = ProductAnalyst(api_key, model)
                        product_result = agent.analyze(selected_competitor, query if query else None)
                        st.markdown(product_result["analysis"])
                        with st.expander("View search details"):
                            st.markdown(f"**Search Query**: `{product_result['search_query']}`")
                            st.markdown("**Raw Results:**")
                            st.text(product_result["search_results"][:2000] + "..." if len(product_result["search_results"]) > 2000 else product_result["search_results"])
                    except Exception as e:
                        st.error(f"Error running Product Analyst: {str(e)}")
            tab_idx += 1

        if news_selected:
            with tab_objects[tab_idx]:
                st.subheader(f"Strategic News: {comp_data['name']}")
                with st.spinner("News Analyst is researching..."):
                    try:
                        agent = NewsAnalyst(api_key, model)
                        news_result = agent.analyze(selected_competitor, query if query else None)
                        st.markdown(news_result["analysis"])
                        with st.expander("View search details"):
                            st.markdown(f"**Search Query**: `{news_result['search_query']}`")
                            st.markdown("**Raw Results:**")
                            st.text(news_result["search_results"][:2000] + "..." if len(news_result["search_results"]) > 2000 else news_result["search_results"])
                    except Exception as e:
                        st.error(f"Error running News Analyst: {str(e)}")
            tab_idx += 1

        # Synthesis tab (only if both agents ran)
        if product_selected and news_selected and product_result and news_result:
            with tab_objects[tab_idx]:
                st.subheader(f"Executive Brief: {comp_data['name']}")
                with st.spinner("Synthesizing intelligence..."):
                    try:
                        synthesizer = IntelligenceSynthesizer(api_key, model)
                        brief = synthesizer.synthesize(
                            comp_data['name'],
                            product_result["analysis"],
                            news_result["analysis"]
                        )
                        st.markdown(brief)
                    except Exception as e:
                        st.error(f"Error generating executive brief: {str(e)}")

        st.divider()
        st.success("✅ Analysis complete!")

# =============================================================================
# FOOTER
# =============================================================================

st.divider()
st.markdown("""
<div style='text-align: center; color: gray; font-size: 0.8em;'>
Competitive Intelligence Network | General Mills<br>
Powered by Claude + Real-time Web Search
</div>
""", unsafe_allow_html=True)
