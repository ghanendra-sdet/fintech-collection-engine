# Collection Engine — Service Architecture (Behind the Scenes)

> A distributed system view of the Collection Engine, useful for understanding integration test
> boundaries and where a defect is likely to originate. This complements
> [`feature-modules.md`](./feature-modules.md) (the "what you see") with the "what's actually
> running" — the service-level decomposition behind each screen.

## Why This View Matters for QA

A single screen (e.g. Transaction Details) is often backed by 4–5 separate services. When a
defect appears on that screen, knowing the likely service boundaries speeds up triage
enormously — is this a **data** problem (wrong value from a service), an **aggregation**
problem (Dashboard Analytics Service combining data incorrectly), or a **presentation** problem
(the UI itself)? This doc exists to make that triage instinct explicit and teachable.

## Service Groups

### Identity & Merchant
- Authentication Service
- Merchant Validation Service
- Merchant Profile Service

### Collection Core
- Collection Dashboard Service
- Collection Transaction Service
- Transaction Search Service
- Transaction Details Service
- Transaction Status Service
- Payment Processing Service

### Collection Type Services (one per collection method)
- UPI Collection Service
- QR Collection Service
- Virtual Account (VAM) Service
- Payment Link Service
- Manual Deposit Service

### Customer & Callbacks
- Customer Details Service
- Callback/Webhook Service

### Settlement & Financial Correctness
- Settlement Service
- Settlement Calculation Service
- Settlement Schedule Service
- Commercial Calculation Service
- GST Calculation Service
- Ledger Service
- Fee Calculation Service
- Merchant Commercial Service
- Reconciliation Service

### Reporting & Analytics
- Reports Service
- Collection Report Service
- Settlement Report Service
- Transaction Report Service
- Dashboard Analytics Service
- Export Service
- Download Service

### Platform Cross-Cutting Services
- Audit Log Service
- Activity Log Service
- Notification Service
- API Validation Service
- Search Service
- Filter Service
- Pagination Service
- Retry Service

## Why Collection Has a Service Per Collection Type

Each collection method (UPI, QR, VAM, Payment Link, Manual Deposit) is its own service rather
than a single "collection processor" with a type flag. From a QA perspective, this means:

- Each type can fail independently — a UPI outage doesn't necessarily mean QR or Payment Link
  collection is also affected, and regression should verify that isolation
- Each type needs its own contract/API test suite, not a shared generic one
- Cross-type consistency checks matter too — e.g. does the Dashboard Analytics Service correctly
  aggregate totals across all five types, or does it silently miss one?

## Integration Test Boundaries (Suggested)

| Boundary | What to Verify |
|---|---|
| Collection Type Service → Payment Processing Service | Each type correctly hands off to the shared processor with the right payload shape |
| Payment Processing Service → Settlement Calculation Service | Successful payments correctly trigger commercial/GST calculation |
| Settlement Calculation Service → Ledger Service | Every settlement produces a matching ledger entry (a historically common defect theme — see [`bug-reports/`](../bug-reports)) |
| Transaction services → Reports Service | Reports reflect the same data visible in Transaction Search/Details, with no drift |
