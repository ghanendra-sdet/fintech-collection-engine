# Collection Engine — Feature & Module Breakdown

> Detailed feature inventory used to scope test coverage. Complements
> [`business-overview.md`](./business-overview.md) (the "why") with the concrete "what" — every
> screen and field that regression and automation planning need to account for.

## Dashboard

- Today's Collection (running total)
- Success Rate
- Failed Transactions (count)
- Pending Transactions (count)

**Test implication:** each dashboard tile is a live aggregate — regression must confirm every
tile matches the underlying transaction data at the moment of load, not a cached/stale value.

## Transaction Search

Searchable by:
- Order ID
- Transaction ID
- UTR (Unique Transaction Reference)
- Merchant Reference
- Customer Name
- Date
- Status

**Test implication:** each search field needs its own positive/negative case (exact match,
partial match where supported, no-match, and invalid-format input), plus combined-filter cases.

## Transaction Details

Fields shown per transaction:
- Payment Status
- Gateway Response
- Customer Details
- Amount
- GST
- Commercial (fee)
- Settlement (linked settlement record)
- Timeline (status history / audit trail for that transaction)

**Test implication:** every field here must match its source-of-truth exactly — this screen is
the most detailed single view of a transaction and is often what a merchant screenshots when
disputing a charge, so accuracy here has outsized support-ticket impact.

## Collection Types

- **UPI Collection**
- **QR Collection**
- **Virtual Account Collection (VAM)**
- **Payment Link Collection**
- **Manual Deposit**

**Test implication:** each collection type has its own initiation flow and its own set of
failure modes (e.g. UPI can fail on invalid VPA, VAM can fail on account mapping issues). A
single generic "test a collection" case is not sufficient — each type needs dedicated coverage.

## Settlement

- Settlement Summary
- Settlement History
- Settlement Status
- Settlement Reports

## Reports

- Daily Collection Report
- Monthly Collection Report
- Merchant Collection Report
- Settlement Report
- Download Reports (export)

---

## Coverage Mapping

| Feature Area | Covered in |
|---|---|
| Dashboard tiles | [`regression-checklist.md`](../regression-checklist.md) TC-003 |
| Transaction Search fields | TC-005, TC-006 |
| Transaction Details consistency | TC-007 |
| Settlement reconciliation | TC-008 |
| Reports & downloads | TC-009, TC-010 |
| Collection Types (UPI / QR / VAM / Payment Link / Manual Deposit) | TC-021–TC-039, derived from [`business-flow.md`](./business-flow.md) |
| Late-succeeding transaction vs. settlement cutoff | TC-040 |
| Cross-screen UI consistency | TC-059–064, see [`ui-consistency.md`](./ui-consistency.md) |

## Future Test Coverage (Not Yet in `regression-checklist.md`)

- Settlement Status transitions as an explicit state machine (similar to how Payout Engine's
  beneficiary approval flow is documented) — Settlement Summary/History/Status/Reports are listed
  above as features, but Settlement Status itself doesn't yet have a dedicated state diagram
- Automating the collection-type-specific test cases (TC-021–TC-039) — currently documented as
  manual test cases only; see the note in [`../regression-checklist.md`](../regression-checklist.md) section 6
