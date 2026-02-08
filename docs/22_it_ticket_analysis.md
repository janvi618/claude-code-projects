# IT Support Ticket Analysis
## Q4 2025 Summary Report
## Prepared by: Greg Thompson, IT Support Manager

---

### Executive Summary

This report analyzes 1,847 IT support tickets from Q4 2025. Key finding: **approximately 60% of tickets are repetitive requests that follow predictable patterns.** Many could potentially be resolved through better self-service tools, documentation, or automation.

---

### Ticket Volume by Category

| Category | Q4 Tickets | % of Total | Avg Resolution Time | Repeat Rate* |
|----------|------------|------------|---------------------|--------------|
| Password/Access | 512 | 28% | 35 min | 73% |
| Software Issues | 387 | 21% | 52 min | 45% |
| Hardware | 294 | 16% | 78 min | 12% |
| How-To Questions | 276 | 15% | 28 min | 89% |
| Network/VPN | 198 | 11% | 41 min | 67% |
| Account Setup | 112 | 6% | 45 min | 82% |
| Other | 68 | 3% | varies | 23% |

*Repeat Rate = tickets that are substantially similar to previous tickets*

---

### Top 20 Most Common Tickets (Q4 2025)

| Rank | Issue | Count | Avg Time | Automatable? |
|------|-------|-------|----------|--------------|
| 1 | Password reset - standard | 156 | 8 min | ✅ Already have self-service |
| 2 | Password reset - service account | 89 | 35 min | ⚠️ Needs approval workflow |
| 3 | VPN connection troubleshooting | 78 | 25 min | ⚠️ Could be scripted diagnostics |
| 4 | New employee account setup | 67 | 45 min | ⚠️ Could be templated |
| 5 | "How do I access [system]?" | 64 | 15 min | ✅ Better documentation |
| 6 | Software installation request | 58 | 40 min | ⚠️ Self-service catalog |
| 7 | Shared mailbox access | 54 | 30 min | ⚠️ Approval workflow |
| 8 | "Application X isn't working" | 51 | 45 min | ❌ Requires diagnosis |
| 9 | Email signature update | 48 | 12 min | ✅ Self-service tool |
| 10 | Printer setup | 47 | 20 min | ✅ Better guides |
| 11 | Distribution list changes | 43 | 18 min | ⚠️ Owner self-service |
| 12 | MFA/2FA issues | 42 | 22 min | ⚠️ Better documentation |
| 13 | Calendar/meeting room help | 38 | 15 min | ✅ Better documentation |
| 14 | File share access request | 36 | 35 min | ⚠️ Approval workflow |
| 15 | "Where is [document/system]?" | 35 | 20 min | ✅ Better search/docs |
| 16 | Guest WiFi setup | 34 | 10 min | ✅ Self-service |
| 17 | Offboarding checklist | 31 | 55 min | ⚠️ Could be automated |
| 18 | Software license questions | 29 | 25 min | ✅ Dashboard/catalog |
| 19 | Laptop replacement request | 27 | varies | ❌ Requires assessment |
| 20 | "What's my username?" | 26 | 5 min | ✅ Self-lookup |

**Summary:** Of top 20 ticket types, 7 could be resolved with better documentation, 8 could be partially automated with approval workflows, 5 require actual human intervention.

---

### Deep Dive: Password & Access Requests

**Total tickets:** 512 (28% of all volume)  
**Estimated time spent:** 298 hours

**Breakdown:**
- Standard password reset: 156 tickets × 8 min = 21 hours
- Service account password: 89 tickets × 35 min = 52 hours  
- New user account setup: 67 tickets × 45 min = 50 hours
- Shared mailbox access: 54 tickets × 30 min = 27 hours
- Distribution list: 43 tickets × 18 min = 13 hours
- File share access: 36 tickets × 35 min = 21 hours
- Other access: 67 tickets × various = ~114 hours

**Observation:** We have self-service password reset but only 40% of employees use it. The rest still open tickets. When asked why:
- "I didn't know it existed" (45%)
- "It didn't work for my account type" (25%)
- "It was easier to just email IT" (20%)
- "I forgot about it" (10%)

**New User Setup Pattern:**
Every new user setup follows the same 15-step process:
1. Create AD account
2. Create email account
3. Add to standard groups based on department
4. Provision software licenses
5. Set up VPN access
6. Create badge access request
7. Add to relevant distribution lists
8. Set up shared drive access
9. Create accounts in department-specific systems
10. Send welcome email with credentials
11. Schedule orientation call
12. Document in HR system
13. Add to IT inventory
14. Close ticket
15. Follow up on day 3

**This is almost entirely automatable** given role/department info from HR, but currently done manually for each hire. At 67 new users in Q4 and 45 min each, that's 50 hours of repetitive work.

---

### Deep Dive: "How Do I...?" Questions

**Total tickets:** 276 (15% of all volume)  
**Estimated time spent:** 129 hours

**Top "How do I" questions:**
1. How do I access the expense system? (32 tickets)
2. How do I set up my email signature? (28 tickets)
3. How do I connect to VPN from home? (26 tickets)
4. How do I find [specific document]? (24 tickets)
5. How do I book a conference room? (22 tickets)
6. How do I add someone to a shared calendar? (19 tickets)
7. How do I set up OneDrive sync? (18 tickets)
8. How do I request software? (17 tickets)
9. How do I set up call forwarding? (15 tickets)
10. How do I access the HR portal? (14 tickets)

**Observation:** These are all documented somewhere, but:
- Documentation is scattered across 4+ systems
- Search rarely surfaces the right answer
- Documents are often outdated
- People find it faster to ask IT than to search

**Idea:** A "Meridian IT FAQ" bot that could answer these questions would eliminate ~130 hours/quarter of IT time and give employees instant answers.

---

### Repeat Offenders: Same People, Same Issues

We tracked individual submitters and found:
- **Top 50 submitters** account for 31% of all tickets
- **Average:** 11.5 tickets per person in Q4
- **Common pattern:** Same person asks similar questions multiple times

**Example - Employee #4521:**
- Oct 3: "How do I access SharePoint?"
- Oct 8: "Can't find [document] in SharePoint"
- Oct 15: "SharePoint is slow"
- Oct 22: "How do I share a SharePoint folder?"
- Nov 2: "Lost access to SharePoint folder"
- Nov 18: "How do I search SharePoint?"
- Dec 4: "SharePoint sync not working"

**7 SharePoint-related tickets from one person in one quarter.** This person needs training, not ticket resolution. But we don't have a systematic way to identify training needs from ticket patterns.

---

### Time Analysis

**Q4 Total IT Support Time:** Approximately 1,420 hours

| Time Category | Hours | % of Total |
|---------------|-------|------------|
| Tickets that could be self-service | ~380 | 27% |
| Tickets that could be automated | ~290 | 20% |
| Tickets needing human judgment | ~520 | 37% |
| Documentation/knowledge work | ~180 | 13% |
| Meetings/admin | ~50 | 3% |

**Finding:** Nearly half of IT support time goes to tasks that could be eliminated or reduced with better tooling. At an estimated fully-loaded cost of $75/hour, that's ~$50K/quarter in potentially reducible support costs.

---

### Recommendations (Previously Submitted, Status Unknown)

| Recommendation | Estimated Time Saved | First Submitted | Status |
|----------------|---------------------|-----------------|--------|
| Automated new user provisioning | 50 hrs/quarter | Q2 2024 | "On roadmap" |
| IT FAQ chatbot | 130 hrs/quarter | Q3 2024 | "Needs evaluation" |
| Self-service software catalog | 40 hrs/quarter | Q1 2024 | "Pending security review" |
| Improved documentation site | 80 hrs/quarter | Q4 2023 | "Needs content resources" |
| Ticket pattern analysis for training | 20 hrs/quarter | Q3 2025 | "Good idea, no bandwidth" |
| Access request workflow automation | 100 hrs/quarter | Q2 2024 | "In backlog" |

**Total potential savings:** ~400 hours/quarter (~$120K/year)

---

### Conclusion

Our IT support model is highly reactive. We're good at resolving tickets but haven't invested in preventing them. The same questions get asked hundreds of times per year because:

1. Documentation exists but isn't discoverable
2. Self-service tools exist but aren't promoted
3. Automation is technically possible but hasn't been prioritized
4. Training needs aren't identified from ticket patterns

Every hour spent on a preventable ticket is an hour not spent on strategic work. We recommend leadership prioritize at least one major automation/self-service initiative in Q1 2026.

---

*Report prepared manually by aggregating data from ticketing system, time tracking, and category analysis. Time to prepare this report: 8 hours. This analysis could itself be partially automated with better reporting tools.*
