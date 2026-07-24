# Sample Defect Report — Collection Engine

> Template + worked examples using dummy data. Reflects the recurring defect themes commonly
> found in Collection Engine regression. Several defects below map directly to integration
> boundaries documented in [`docs/service-architecture.md`](./docs/service-architecture.md) and
> flow steps in [`docs/business-flow.md`](./docs/business-flow.md) — see
> [`docs/README.md`](./docs/README.md) for the full documentation map.

## Defect Theme Taxonomy

Recurring defect themes tracked for this module:

- Ledger debit fee missing
- Commercial calculation mismatch
- GST mismatch
- Settlement inconsistency
- Report mismatch
- Search/filter issue
- Export issue
- Permission issue
- Validation issue
- Dashboard issue
- API validation issue

**Severity categories used:** Minor, Major, Critical, Blocker.

---

## Defect #1

| Field | Value |
|---|---|
| **ID** | BUG-COL-1042 (sample) |
| **Title** | Ledger debit entry missing for commercial fee on successful UPI collection |
| **Severity** | Critical |
| **Module** | Collection → Ledger |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Login as dummy merchant `DEMOMERCHANT001`
2. Initiate a collection of ₹1000 with a 2% commercial fee
3. Wait for transaction status to become `SUCCESS`
4. Navigate to Ledger and search for the corresponding entry

**Expected Result**
A debit ledger entry of ₹20 (2% of ₹1000) should appear, matching the commercial fee deducted
from the merchant's settlement amount.

**Actual Result**
No ledger entry is created for the commercial fee — the settlement amount reflects the deduction,
but the ledger shows only the gross transaction credit, with no matching debit line.

**Impact**
Breaks the audit trail: settlement and ledger totals will not reconcile, which could cause
discrepancies during a compliance or financial audit.

**Root Cause (if known)**
`[Add details]` — commonly caused by an async ledger-write step not being triggered on the same
event as the settlement calculation.

**Suggested Fix**
Ensure the ledger debit write and settlement calculation are triggered from the same transaction
event, ideally within the same atomic operation or a reliably retried async job.

---

## Defect #2

| Field | Value |
|---|---|
| **ID** | BUG-COL-1078 (sample) |
| **Title** | GST rounding mismatch between UI display and downloaded report |
| **Severity** | Major |
| **Module** | Collection → Reports |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Initiate a collection producing a commercial fee with a fractional GST value (e.g. GST on ₹17
   at 18% = ₹3.06)
2. View the transaction in the dashboard/transaction details (shows ₹3.06)
3. Download the CSV report for the same date range

**Expected Result**
GST value in the downloaded report should exactly match the value shown in the UI (₹3.06).

**Actual Result**
Report shows ₹3.10 — rounding is applied differently between the UI (rounds to nearest paisa)
and the report generation service (rounds up to nearest 10 paise).

**Impact**
Merchant-facing financial reports don't match the platform's own UI — a trust and compliance
issue even though the discrepancy is small per transaction.

**Suggested Fix**
Centralize the rounding rule in a single shared calculation function used by both the UI and the
report generation service.

---

## Defect #3

| Field | Value |
|---|---|
| **ID** | BUG-COL-1105 (sample) |
| **Title** | Settlement report total doesn't match Ledger total for the same date range |
| **Severity** | Critical |
| **Module** | Collection → Settlement / Reports |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Run a settlement cycle covering a set of dummy SUCCESS transactions
2. Open the Settlement Report for that cycle's date range
3. Independently sum the corresponding Ledger entries for the same date range

**Expected Result**
The Settlement Report total should exactly equal the sum of Ledger entries for the same
transactions — settlement is, by definition, a reflection of the ledger.

**Actual Result**
The Settlement Report total is ₹1,240 higher than the Ledger sum. Investigation shows the
Settlement Report includes a small number of transactions that were later reversed, while the
Ledger correctly excludes them — the two services are reading from different snapshots of
transaction state.

**Impact**
A merchant reconciling the Settlement Report against their own bank credit would see a mismatch
they cannot explain — directly undermines trust in the platform's reporting.

**Suggested Fix**
Settlement Report generation should read from the same authoritative transaction-state source as
the Ledger Service (or be generated *from* the Ledger directly), not from a separately-cached
transaction snapshot.

---

## Defect #4

| Field | Value |
|---|---|
| **ID** | BUG-COL-1131 (sample) |
| **Title** | Transaction Search status filter returns stale results after a status change |
| **Severity** | Major |
| **Module** | Collection → Transaction Search |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Search Transaction Search filtering by status = `DEEMED`
2. In a separate session, that same transaction resolves to `SUCCESS`
3. Refresh the original search (same filter, same page)

**Expected Result**
The now-`SUCCESS` transaction should disappear from the `DEEMED` filter results on refresh.

**Actual Result**
The transaction remains in the `DEEMED` filtered results after refresh — the search index/cache
was not invalidated when the underlying transaction status changed.

**Impact**
Merchants investigating "stuck" transactions see incorrect, outdated results, which can lead to
duplicate support inquiries or unnecessary manual investigation of transactions that already
resolved successfully.

**Suggested Fix**
Invalidate or update the search index synchronously (or near-synchronously) on every transaction
status transition, not only on initial transaction creation.

---

## Defect Reporting Template (blank)

| Field | Value |
|---|---|
| **ID** | |
| **Title** | |
| **Severity** | Minor / Major / Critical / Blocker |
| **Module** | |
| **Environment** | |

**Steps to Reproduce**
1.
2.
3.

**Expected Result**


**Actual Result**


**Impact**


**Suggested Fix**

