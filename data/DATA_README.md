# Meridian Industries - Data Files

## Overview

These datasets support the Meridian scenario exercise. They contain operational, financial, and usage data that tell a story—but the story isn't obvious until you analyze the data carefully.

## Files

### EnterpriseAI.ai Usage
- **enterpriseai_monthly_summary.csv** - Monthly aggregated usage (March-December 2025). Shows the adoption curve: 59% initial trial → 37% sustained usage. Above industry benchmarks, but shallow.
- **enterpriseai_usage_sample.csv** - Daily session-level data sample. Shows individual usage patterns, feature breakdown, session durations.

### Star Performer Metrics
- **star_performer_metrics.csv** - Monthly KPIs for each of the 9 star performers. Includes baseline periods, AI adoption dates, and post-adoption improvement curves.
- **star_performer_reference.csv** - Reference table with adoption dates, tools used, and estimated annual value. Key for overlay analysis.

### Department Performance
- **department_kpis.csv** - Monthly department-level metrics. Compare departments with star performers vs. without. The pattern is there if you look for it.

### Pilot Programs
- **pilot_program_results.csv** - Official sanctioned pilot results. Customer Insights (modest success), Marketing (inconclusive), Supply Chain (delayed), R&D (never launched).

### Financial Analysis
- **tool_comparison.csv** - Side-by-side comparison of EnterpriseAI.ai vs. frontier tools.
- **financial_summary.csv** - Cost vs. value analysis. The punchline: $8M official spend with no measurable return vs. $3,360 personal spend with $1.26M documented value.

## The Hidden Insight

When you overlay the star performer AI adoption dates onto the department KPI trends, a pattern emerges:

1. Departments with star performers show improvement starting 1-2 months after their AI adoption date
2. Departments without star performers show flat performance
3. The official EnterpriseAI.ai usage in those same departments is minimal
4. The improvement isn't coming from the enterprise tool—it's coming from frontier tools used against policy

## Suggested Analyses

1. **Adoption curve**: Plot EnterpriseAI.ai MAU over time (shows healthy adoption, but...)
2. **Feature distribution**: Pie chart of usage by feature (email drafting dominates at 90%+)
3. **Use case depth**: Show that <2% of usage is high-value features
4. **Star performer J-curves**: Line charts showing metric improvement after AI adoption
5. **Department comparison**: Overlay star performer adoption dates on department KPI trends
6. **Cost-per-value**: Compare $8M/no-value vs. $3.4K/$1.26M
7. **Tool ROI**: Enterprise tool ROI vs. frontier tool ROI

## Dashboard Story

The data tells a story of contrast:
- The expensive ($8M), sanctioned, enterprise-wide deployment → 37% adoption (above average!), but 90% shallow use cases, no measurable business impact
- The cheap ($3.4K), prohibited, individual experimentation → $1.26M documented value, workflow transformation

The paradox: Meridian succeeded at adoption and failed at transformation. Jordan's argument writes itself once you see the data clearly.
