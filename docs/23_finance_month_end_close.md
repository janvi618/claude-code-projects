# Finance Month-End Close Checklist
## Standard Operating Procedure v4.1
## Last Updated: September 2024

---

> **Note (Added November 2025):** This checklist was designed for a smaller company. As we've grown, several steps have become bottlenecks. We've flagged issues but haven't had capacity to redesign the process. Please allow extra buffer time.

---

## Overview

Month-end close is targeted for completion by business day 5 (BD5) of the following month. Current average: **BD8** (3 days over target).

**Key Metrics:**
- Target close: BD5
- Actual average: BD8
- Total staff hours: 180-220 hours
- Pain points identified: 14
- Pain points addressed: 3

---

## Day 1: Data Collection

### 1.1 Revenue Recognition (4-6 hours)
- [ ] Export sales data from CRM (Salesforce)
- [ ] Export billing data from invoicing system (QuickBooks)  
- [ ] Export contract data from contract management (DocuSign)
- [ ] Manually reconcile discrepancies between systems

**Known Issue:** These three systems don't integrate. Data is exported to Excel and manually matched by contract ID. Typical discrepancy rate: 8-12% of line items require investigation.

**Time sink:** Average 90 minutes spent chasing down "why does CRM show $50K but billing shows $47K?" answers. Usually involves emailing 3-4 sales reps.

### 1.2 Expense Collection (3-4 hours)
- [ ] Send reminder email to all departments for expense submissions
- [ ] Wait for responses (biggest delay factor)
- [ ] Follow up with non-responders
- [ ] Log who responded and when for escalation if needed

**Known Issue:** Despite automated reminders, 40% of expense reports come in late. Finance team sends individual follow-ups, which takes 2-3 hours.

### 1.3 Accounts Payable Verification (2-3 hours)
- [ ] Pull AP aging report from system
- [ ] Cross-reference with PO system for outstanding orders
- [ ] Verify large invoices against contracts
- [ ] Flag discrepancies for review

**Known Issue:** AP system, PO system, and contract system don't talk to each other. Amit has built a series of Excel lookups to semi-automate matching, but it still requires manual verification.

---

## Day 2: Data Reconciliation

### 2.1 Bank Reconciliation (2-3 hours)
- [ ] Download bank statements
- [ ] Match transactions to GL entries
- [ ] Investigate unmatched items
- [ ] Document reconciling items

**Known Issue:** ~15% of transactions require manual investigation. Common causes: timing differences, missing descriptions, split transactions.

### 2.2 Intercompany Reconciliation (3-4 hours)
- [ ] Request IC balances from subsidiaries
- [ ] Compare to local records
- [ ] Identify and resolve discrepancies
- [ ] Document adjustments

**Known Issue:** Subsidiaries use different ERP systems. Data comes in via email in various formats. Amit spends ~2 hours just reformatting data before analysis can begin.

### 2.3 Inventory Reconciliation (2-3 hours)
- [ ] Pull inventory counts from WMS
- [ ] Compare to GL balances
- [ ] Investigate variances over $5K
- [ ] Propose adjustment entries if needed

**Known Issue:** WMS syncs to GL daily but with 24-hour lag. Timing differences create false variances that have to be manually filtered out.

---

## Day 3: Analysis & Adjustments

### 3.1 Variance Analysis (4-6 hours)
- [ ] Calculate actual vs. budget variances by department
- [ ] Identify variances over 10% for explanation
- [ ] Email department heads for variance explanations
- [ ] Compile explanations into variance report

**Known Issue:** This is where Amit has made good progress. Previously took 2 full days; now takes 4-6 hours using his Claude-assisted analysis system. *However, this efficiency is "off the books" since he's using an unapproved tool.*

### 3.2 Accruals & Deferrals (2-3 hours)
- [ ] Calculate revenue deferrals
- [ ] Calculate expense accruals
- [ ] Prepare journal entries
- [ ] Document calculations and assumptions

### 3.3 Fixed Asset Review (1-2 hours)
- [ ] Review capex additions
- [ ] Calculate depreciation
- [ ] Verify asset disposals
- [ ] Update fixed asset register

---

## Day 4: Report Preparation

### 4.1 Financial Statement Prep (4-5 hours)
- [ ] Generate trial balance
- [ ] Prepare income statement
- [ ] Prepare balance sheet
- [ ] Prepare cash flow statement
- [ ] Check that statements balance and tie out

### 4.2 Management Reports (3-4 hours)
- [ ] Executive summary (written narrative)
- [ ] Department P&L summaries
- [ ] KPI dashboard update
- [ ] Variance commentary

**Known Issue:** Management reports require manually copying data from the ERP into PowerPoint templates, then writing narrative explanations. This is the most labor-intensive part of close.

**Time sink:** Writing variance commentary alone takes 2 hours. We explain the same patterns (seasonality, timing, one-time items) month after month.

### 4.3 Board Package Prep (if applicable) (3-4 hours)
- [ ] Consolidate financials into board template
- [ ] Add charts and visualizations
- [ ] Write executive narrative
- [ ] Review with CFO
- [ ] Revise based on feedback
- [ ] Finalize and distribute

---

## Day 5: Review & Sign-off

### 5.1 Quality Review (2-3 hours)
- [ ] Cross-check all calculations
- [ ] Verify source documentation
- [ ] Review for completeness
- [ ] Address review comments

### 5.2 Final Adjustments (1-2 hours)
- [ ] Make any final corrections
- [ ] Re-run trial balance
- [ ] Confirm statements balance

### 5.3 Sign-off & Distribution (1 hour)
- [ ] Obtain CFO approval
- [ ] Distribute reports to stakeholders
- [ ] Archive documentation
- [ ] Log close completion time

---

## Time Budget vs. Actual (Q4 2025 Average)

| Phase | Budget (hrs) | Actual (hrs) | Variance |
|-------|--------------|--------------|----------|
| Data Collection | 10 | 14 | +40% |
| Reconciliation | 8 | 12 | +50% |
| Analysis & Adjustments | 8 | 9 | +12% |
| Report Prep | 10 | 14 | +40% |
| Review & Sign-off | 4 | 5 | +25% |
| **Total** | **40** | **54** | **+35%** |

---

## Identified Bottlenecks

| Bottleneck | Time Impact | Root Cause | Potential Solution |
|------------|-------------|------------|-------------------|
| System reconciliation | +4 hrs | No integration | API connectors |
| Expense collection | +3 hrs | Late submissions | Stricter enforcement |
| Data formatting | +2 hrs | Different formats | Standardized templates |
| Variance commentary | +2 hrs | Manual writing | AI-assisted draft |
| Manual data entry | +2 hrs | No automation | RPA or integration |
| Report formatting | +2 hrs | Copy-paste to PPT | Auto-generated reports |
| Error investigation | +2 hrs | Data quality issues | Validation rules |
| Waiting for inputs | +4 hrs | Dependency delays | Parallel processing |

---

## Process Improvement Wishlist

*Items Finance team has requested but not yet implemented:*

1. **Automated data reconciliation** between CRM, billing, and contracts
2. **Expense deadline enforcement** with auto-escalation
3. **Standard templates** for subsidiary data submission
4. **Automated variance commentary** for common patterns
5. **Real-time GL updates** from sub-systems (vs. daily batch)
6. **Self-service department reports** so Finance doesn't have to generate
7. **Audit trail automation** instead of manual documentation
8. **Bank reconciliation matching** using pattern recognition
9. **Accrual calculation templates** that auto-populate
10. **Board package generator** that pulls from live data

*Estimated time savings if all implemented: 15-20 hours/month close (35-45%)*

---

## Dependencies on Other Teams

| Team | What We Need | When | Reliability |
|------|--------------|------|-------------|
| Sales | Revenue data, commissions | BD1 | 70% on time |
| Operations | Inventory counts | BD1 | 85% on time |
| All Depts | Expense reports | BD1 | 60% on time |
| HR | Headcount/payroll | BD1 | 95% on time |
| Subsidiaries | IC balances | BD2 | 50% on time |
| Dept Heads | Variance explanations | BD3 | 40% on time |

**Observation:** Half our close delay is waiting for inputs from other teams. We've tried reminders, deadlines, and escalation. Compliance remains inconsistent.

---

## Notes from Finance Team

*"We've been talking about automating this process for three years. Every year it's 'next year.' Meanwhile, the team that was designed for a $50M company is trying to close books for a $200M company with the same manual processes."* - Amit

*"The irony is we spend so much time on close that we don't have time for analysis. The business wants insights; we deliver numbers. There's a difference."* - Patricia

*"Month-end is basically a week of data entry followed by a weekend of checking our data entry."* - James

---

*This SOP was written by the Finance team as documentation but also as evidence that the process needs investment. If you're reading this from outside Finance, now you know why we're always stressed at month-end.*
