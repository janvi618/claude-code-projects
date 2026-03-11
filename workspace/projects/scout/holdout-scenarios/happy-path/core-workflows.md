# Happy Path: Daily Brief Delivery

## Scenario: Monday Morning Brief Covers Weekend

A user opens the SCOUT dashboard on Monday at 7:15 AM CT. They should see a daily brief dated today (Monday). The brief should cover intelligence collected from Friday evening through Monday morning. The brief should contain at minimum a Lead Signal section and at least one other section (Products, Technology, Science, or Worth Watching). The brief should be between 300 and 800 words. Every factual claim in the brief should correspond to an intelligence item in the database with a relevance score >= 50.

## Scenario: New Viewer Receives Brief Email

An admin invites a new user with the "viewer" role. The next weekday morning, that user receives the daily brief email at the email address used for the invitation. The email contains an HTML-formatted brief with a "View in Dashboard" link. Clicking the link opens the dashboard and shows the same brief. The user does not see any admin functionality.

## Scenario: Intelligence Feed Filters Work

A viewer navigates to the Intelligence Feed and selects "Conagra Brands" from the competitor filter. All displayed items should have "Conagra" or "Conagra Brands" in their companies array. The user then adds "new_products" to the domain filter. All displayed items should now match both filters simultaneously. Removing all filters returns the full unfiltered feed.

## Scenario: Research Chat Returns Cited Answers

A viewer opens the Research Chat and asks: "What has PepsiCo done in protein innovation recently?" The system returns a synthesized answer within 30 seconds. The answer references at least one specific intelligence item with a clickable source link. The source links point to real articles or items in the knowledge base. A follow-up suggestion is offered.
