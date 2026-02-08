# MEMO - CONFIDENTIAL

**From:** Sarah Ndiaye, VP Information Security  
**To:** Vikram Anand, CTO  
**CC:** Judith Abramowitz, CLO  
**Date:** April 14, 2025  
**Subject:** Security Review - Expanded AI Tool Access Request

---

Vikram,

Per your request, my team has conducted an initial security review of the proposal to expand AI tool access beyond EnterpriseAI.ai. I want to flag several concerns that require further analysis before we can proceed.

## Data Residency and Sovereignty

The proposed tools (including direct API access to OpenAI and Anthropic models) route data through servers outside our approved data centers. For our European operations, this raises GDPR concerns. For our government contracts, this may violate data residency requirements. We need clarity on:

- Where prompts and outputs are stored
- Retention periods
- Whether our data is used for model training
- Jurisdictional questions for cross-border data flows

## Training Data Liability

Recent litigation (Getty v. Stability AI, NYT v. OpenAI) raises questions about intellectual property in AI training data. If we use these tools to generate content, what's our liability exposure? This needs Legal's input, but from a security perspective, I'm concerned about the lack of indemnification clarity.

## Audit Trail Requirements

Our SOC 2 compliance requires comprehensive audit trails for data access and processing. The proposed tools don't integrate with our SIEM, making it difficult to:

- Track what data was processed
- Identify potential data exfiltration
- Respond to security incidents
- Demonstrate compliance to auditors

## Shadow AI

I want to flag something we're already seeing: employees using personal ChatGPT accounts for work tasks, despite our policy prohibiting this. Expanding access to more tools may reduce this behavior—or it may normalize the idea that "any AI tool is fine." We need a clear governance framework before we open more doors.

## The Samsung Precedent

I'm sure you saw the Samsung incident last year—engineers pasting proprietary source code into ChatGPT, resulting in a significant IP exposure. We've had three near-misses internally (details in attached incident reports). More capable tools in more hands increases this risk surface.

## Recommendation

I'm not saying no. I'm saying we need 4-6 weeks for a comprehensive risk assessment before proceeding. I'd rather move carefully now than explain a breach to the board later.

Happy to discuss.

Sarah

---

**Attachments:**
- Shadow_AI_Incident_Reports_Q1_2025.pdf
- Data_Residency_Requirements_Matrix.xlsx
- AI_Vendor_Security_Questionnaire_Template.docx
