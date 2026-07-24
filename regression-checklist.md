# Collection Engine — Regression Checklist & Test Cases

> Sample regression suite structure with dummy data. Format: ID | Scenario | Steps | Expected Result

## 1. Core Regression Flow

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-001 | Merchant login — valid credentials | 1. Navigate to login page 2. Enter valid dummy merchant ID + password 3. Submit | Merchant is redirected to Dashboard |
| TC-002 | Merchant login — invalid credentials | 1. Enter invalid password 2. Submit | Error message shown, login blocked |
| TC-003 | Dashboard summary accuracy | 1. Login 2. Compare dashboard totals to transaction list totals | Dashboard totals match underlying transaction data |
| TC-004 | Initiate a new collection | 1. Go to Collection 2. Enter dummy amount ₹500 3. Select dummy VPA `test@dummybank` 4. Submit | Transaction created with status INITIATED |
| TC-005 | Transaction search — by date range | 1. Go to Transaction Search 2. Filter last 7 days | Only transactions within range are shown |
| TC-006 | Transaction search — by status | 1. Filter by status = SUCCESS | Only SUCCESS transactions shown |
| TC-007 | Transaction details consistency | 1. Open a transaction from search results 2. Compare all fields to search row | All fields match exactly, no drift |
| TC-008 | Settlement reconciliation | 1. Go to Settlement 2. Compare settled amount to sum of SUCCESS transactions minus commercial | Settlement amount is correct to the paisa |
| TC-009 | Report download — CSV | 1. Go to Reports 2. Download CSV for date range | Downloaded totals match on-screen dashboard totals |
| TC-010 | Report download — PDF | 1. Download PDF report | PDF renders correctly, totals match CSV export |

## 2. Collection-Type-Specific Test Cases

> Each collection type has its own initiation flow and failure surface — see
> [`docs/business-flow.md`](./docs/business-flow.md) for the full flow diagrams these cases are
> derived from. A single generic "test a collection" case is not sufficient coverage.

### UPI Collection

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-021 | UPI — customer approves | 1. Initiate a dummy UPI collect request 2. Simulate customer approval | Status transitions INITIATED → SUCCESS |
| TC-022 | UPI — customer declines | 1. Initiate request 2. Simulate customer decline | Status transitions to FAILED with a clear reason |
| TC-023 | UPI — customer takes no action | 1. Initiate request 2. Let the approval window elapse | Status transitions to EXPIRED, not left indefinitely PENDING |
| TC-024 | UPI — invalid VPA at request time | 1. Initiate request with a malformed dummy VPA | Request rejected before it reaches the customer's app |

### QR Collection

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-025 | QR — dynamic amount honored | 1. Generate a dynamic QR with a fixed dummy amount 2. Pay via scan | Amount charged matches the QR exactly, not editable by the customer |
| TC-026 | QR — static QR customer-entered amount | 1. Generate a static QR 2. Enter a dummy amount while paying | Correct amount is captured and reconciled |
| TC-027 | QR — re-scan after successful payment | 1. Pay a dynamic QR successfully 2. Scan and attempt to pay the same QR again | Second payment is blocked — no double charge |
| TC-028 | QR — expired QR | 1. Wait past the QR's validity window 2. Attempt payment | Payment blocked with a clear "QR expired" message |

### Virtual Account (VAM) Collection

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-029 | VAM — correct merchant/customer mapping | 1. Transfer dummy funds to a dummy VAN 2. Check which merchant/customer it's attributed to | Credit is matched to exactly the right merchant/customer, never misattributed |
| TC-030 | VAM — overpayment against expected amount | 1. Transfer more than the expected dummy amount to a VAN | Overpayment is flagged/handled per defined business rule, not silently accepted as a match |
| TC-031 | VAM — underpayment against expected amount | 1. Transfer less than the expected dummy amount | Underpayment is flagged, not marked as a completed match |
| TC-032 | VAM — delayed bank notification | 1. Simulate a delayed credit notification from the bank (test env) | Transaction remains in a clear pending state until the notification arrives — no false SUCCESS |

### Payment Link Collection

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-033 | Payment Link — happy path | 1. Generate a dummy payment link 2. Open and pay via UPI | Payment succeeds, status reflects correctly |
| TC-034 | Payment Link — reuse after success | 1. Pay a link successfully 2. Reopen the same link and attempt payment again | Second payment attempt is blocked — link is single-use once paid |
| TC-035 | Payment Link — expired link | 1. Wait past the link's expiry 2. Attempt to open/pay | Clear "link expired" message, payment blocked |

### Manual Deposit

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-036 | Manual Deposit — reconciliation matches proof | 1. Enter a dummy manual deposit reference matching dummy proof-of-deposit data | Transaction marked SUCCESS only after the entered amount matches the supporting proof |
| TC-037 | Manual Deposit — amount mismatch vs. proof | 1. Enter a manual amount that does not match the dummy deposit proof | Reconciliation blocked/flagged, not auto-approved |
| TC-038 | Manual Deposit — duplicate entry prevention | 1. Attempt to manually reconcile the same deposit reference twice | Second attempt is rejected as a duplicate |
| TC-039 | Manual Deposit — flows into settlement like automated types | 1. Successfully reconcile a manual deposit 2. Run the next settlement cycle | Manually-reconciled transaction settles alongside automated ones, with no separate/inconsistent treatment |

## 3. Commercial & GST Validation

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-011 | Commercial fee calculation | 1. Initiate transaction of ₹1000 with 2% commercial | Fee = ₹20, net to merchant = ₹980 |
| TC-012 | GST on commercial | 1. Commercial fee ₹20, GST 18% | GST = ₹3.60, total deduction = ₹23.60 |
| TC-013 | Commercial rounding — edge case | 1. Transaction amount that produces a fractional paisa fee | Rounding follows defined rule (e.g. round half up), consistent across UI and report |
| TC-014 | Ledger debit entry created | 1. Successful transaction with commercial | Ledger shows matching debit entry for fee deducted |

## 4. Negative & Edge Cases

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-015 | Empty search results | 1. Search with filters matching no transactions | "No results found" message shown, no error |
| TC-016 | Invalid filter combination | 1. Apply an end date earlier than start date | Validation error shown, search blocked |
| TC-017 | Duplicate transaction request | 1. Submit the same collection request twice rapidly | Second request is either blocked or correctly deduplicated |
| TC-018 | Large transaction volume in search | 1. Search a date range with 10,000+ dummy transactions | Results paginate correctly, no timeout |
| TC-019 | Permission check — restricted admin action | 1. Login as a merchant-role user 2. Attempt to access admin-only settlement monitoring | Access denied |
| TC-020 | Settlement mismatch detection | 1. Simulate a scenario where ledger total ≠ settlement total (test data) | Discrepancy is flagged, not silently settled |
| TC-040 | Late-succeeding transaction after settlement cutoff | 1. A transaction succeeds just after a settlement cycle has already run | Transaction rolls into the *next* settlement cycle automatically — never silently dropped |

## 5. UI Consistency

> Derived from [`docs/ui-consistency.md`](./docs/ui-consistency.md) — cross-screen consistency,
> not single-screen correctness.

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-059 | Status badge consistency across screens | 1. Take one dummy transaction 2. View its status on Dashboard, Transaction Search, Transaction Details, and an exported Report | Label text and color convention are identical across all four views |
| TC-060 | Currency formatting consistency | 1. View a ₹1,00,000 dummy transaction on-screen 2. Export it to CSV/PDF | Decimal places, thousands separator, and currency symbol placement match exactly between UI and export |
| TC-061 | Date/time formatting consistency | 1. Compare the same transaction's timestamp across Dashboard, Details, and Reports | Same date format and timezone representation everywhere |
| TC-062 | Terminology consistency | 1. Compare column headers/labels referring to the same concept (e.g. "Merchant Reference") across Search, Details, and Reports | Identical terminology used — no "Merchant Ref" in one place and "Ref ID" in another |
| TC-063 | Empty state presence | 1. Search with filters guaranteed to match nothing on Transaction Search, Settlement History, and Reports | Each shows a deliberate, informative empty state — never a blank screen |
| TC-064 | Status badge distinguishable without color | 1. View SUCCESS/FAILED/DEEMED/EXPIRED badges with color/grayscale rendering simulated | Each status remains distinguishable via icon/text label alone, not color dependency |

## 6. Full Regression Checklist

- [ ] Login
- [ ] Dashboard
- [ ] Merchant Profile
- [ ] Collection
  - [ ] UPI Collection (approve / decline / expire / invalid VPA)
  - [ ] QR Collection (dynamic / static / re-scan / expiry)
  - [ ] Virtual Account Collection (mapping / over-payment / under-payment / delayed notification)
  - [ ] Payment Link Collection (happy path / reuse / expiry)
  - [ ] Manual Deposit (reconciliation match / mismatch / duplicate / settlement inclusion)
- [ ] Transaction Search
- [ ] Transaction Details
- [ ] Settlement
- [ ] Reports
- [ ] Downloads / Export
- [ ] Commercial Calculation
- [ ] GST Calculation
- [ ] Ledger Entries
- [ ] Permissions / Role-Based Access
- [ ] UI Consistency (status badges, formatting, terminology, empty states, accessibility)

## 7. Priority Automation Candidates

1. Login
2. Dashboard
3. Collection
4. Transaction Search
5. Transaction Details
6. Settlement

These six are automated first because they form the primary merchant regression path and are
run on every release — see [`automation/`](./automation) for the Playwright implementation.
Collection-type-specific scenarios (section 2 above) and UI consistency checks (section 5 above)
are the next priority tier for automation expansion, since they currently exist as documented
manual test cases only.
