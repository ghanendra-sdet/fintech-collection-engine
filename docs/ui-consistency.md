# Collection Engine — UI Consistency

> A dimension that's easy to skip in a test plan but shows up constantly in real regression: does
> the same concept look, read, and behave the same way **everywhere it appears**? This document
> exists because "Dashboard shows it one way, Transaction Details shows it another way" is one of
> the most common — and most support-ticket-generating — defect classes in a financial dashboard
> with this many screens surfacing the same underlying data.

## Why This Is Its Own Testing Dimension

Collection Engine surfaces the same transaction data across at least five different screens —
Dashboard, Transaction Search, Transaction Details, Settlement, and Reports (see
[`feature-modules.md`](./feature-modules.md). Each was very likely built by a different
engineer, at a different time, against the same backend data. That's exactly the setup where
formatting, terminology, and status representation quietly drift apart between screens — each
individually "correct," but inconsistent as a set.

## 1. Status Badge Consistency

The same transaction status must render identically — same label text, same color, same icon —
everywhere it appears.

| Status | Expected Label | Expected Color (convention) |
|---|---|---|
| SUCCESS | "Success" | Green |
| FAILED | "Failed" | Red |
| DEEMED | "Deemed" | Amber/Yellow |
| EXPIRED | "Expired" | Grey/Neutral |
| INITIATED / PROCESSING | "Processing" | Blue/In-progress |

**Test scenario:** open the same transaction on Dashboard (as a tile rollup), Transaction Search
(as a list row), Transaction Details (as the primary status), and any exported Report — the
label text and color convention must match exactly across all four. A transaction shown as
green "Success" in one place and a different shade or label ("Completed", "Settled") in another
is a defect, even though neither individual screen is "wrong" in isolation.

## 2. Currency & Number Formatting

| Element | Convention to Verify |
|---|---|
| Currency symbol | Consistent placement (₹ prefix vs. suffix) everywhere |
| Decimal places | Always 2 decimal places for amounts, no screen truncating to whole rupees while another shows paise |
| Thousands separator | Consistent (Indian numbering: ₹1,00,000 vs. international ₹100,000) — pick one and verify it everywhere |
| Negative/debit amounts | Consistent representation (e.g. always `-₹X` or always `(₹X)`, never mixed) |

**Test scenario:** the same ₹1,00,000 transaction must display with identical formatting on
Dashboard, Search results, Details, Settlement, and any downloaded Report (CSV/PDF) — a CSV
export that drops the thousands separator while the UI keeps it is a common, easy-to-miss defect.

## 3. Date & Time Formatting

- Is the date format (DD/MM/YYYY vs. MM/DD/YYYY vs. ISO) consistent across every screen and
  every export format?
- Is the timezone consistent and clearly indicated, especially important since settlement
  cutoffs (see [`business-flow.md`](./business-flow.md) section 3) are time-sensitive?
- Do relative-time displays ("2 hours ago") and absolute timestamps agree when both are shown
  for the same event?

## 4. Terminology Consistency

The glossary in [`business-overview.md`](./business-overview.md) defines the canonical terms —
UI text should never introduce synonyms for the same concept. Common drift patterns to test for:

- "Settlement" vs. "Payout" vs. "Disbursement" used interchangeably for the same concept
  (Settlement here is distinct from the Payout Engine product — mixing the terms in-UI confuses
  merchants about which product a screen belongs to)
- "Commercial" vs. "Fee" vs. "Charge" used interchangeably
- "Merchant Reference" vs. "Merchant Ref" vs. "Ref ID" as column headers across different tables

## 5. Empty States & Error Messages

- Does every list/table screen (Transaction Search, Settlement History, Reports) have a
  deliberate, informative empty state — not a blank white screen — when there's no data?
- Are validation error messages worded consistently for the same underlying error across
  different forms (e.g. an invalid date range on Transaction Search vs. on a Report filter)?
- Do loading states look and behave the same way across screens (same spinner/skeleton pattern)?

## 6. Cross-Browser & Responsive Consistency

- Do status badges, currency formatting, and table layouts render identically across Chrome,
  Firefox, and Safari/WebKit?
- On smaller viewports, does the Dashboard's tile layout and the Transaction Search table degrade
  gracefully (responsive reflow) without losing or misrepresenting any status/amount information?

## 7. Accessibility Consistency

- Are status badges distinguishable by more than color alone (icon or text label), so the
  SUCCESS/FAILED/DEEMED/EXPIRED distinction survives for colorblind users?
- Do interactive elements (buttons, links) have consistent, sufficient contrast and focus
  indicators across every screen, not just the ones that got the most design attention?

---

## Coverage Mapping

See [`test-cases/regression-checklist.md`](../regression-checklist.md) section 14 for
the UI consistency test cases (TC-059–064) derived from this document.

## Why This Matters at Scale

A single inconsistency (say, Settlement showing amounts without paise while Transaction Details
shows them with paise) looks minor in isolation. But across a platform processing high transaction
volume (see [`service-architecture.md`](./service-architecture.md) and
[`test-reports/performance-test-summary.md`](../performance-test-summary.md)), that
kind of drift is exactly what erodes merchant trust over time — it reads as "the numbers don't
quite add up," even when every individual number is technically correct.
