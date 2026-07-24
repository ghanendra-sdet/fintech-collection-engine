# Collection Engine — Shared Platform Services

> Collection Engine doesn't run in isolation — it's one of several products (Collection, Payout,
> Connected Banking, BBPS, Reseller, and others) built on top of a **common company-wide
> platform layer**. This document lists the shared services this product depends on, separate
> from the ~40 services enumerated in [`service-architecture.md`](./service-architecture.md)
> that belong to Collection Engine specifically.

## Why "Shared Platform" Matters for Testing

A defect in a shared service doesn't stay contained to one product. A bug in the company-wide
**GST Engine**, for example, doesn't just affect Collection Engine's commercial calculations —
it silently affects Payout's GST calculation, Connected Banking's fee GST, and any other product
that calls the same engine. This is why a change to a shared service should trigger **cross-
product smoke testing**, not just regression scoped to whichever product initiated the change.

## Shared Platform Services (Company-Wide)

### Identity & Access
- Authentication
- Authorization
- OTP Service
- User Management
- Role & Permission Service

### Merchant Lifecycle
- Merchant Management
- Merchant Onboarding
- Merchant Activation
- Merchant Profile

### Financial Engines
- Commercial Engine
- GST Engine
- Ledger Engine
- Settlement Engine
- Reconciliation Engine

### Reporting & Data Export
- Report Engine
- Export Engine
- Download Engine
- Dashboard Service
- Search Engine
- Filter Engine

### Platform Infrastructure
- Audit Logs
- Activity Logs
- Notification Service
- API Gateway
- Validation Service
- File Upload Service
- File Download Service
- Scheduler / Background Workers

## How Collection Engine Depends on These

- **GST Engine / Commercial Engine** — Collection's own Commercial Calculation Service and GST
  Calculation Service (see `service-architecture.md`) are product-specific orchestration on top
  of these shared engines, not a reimplementation of GST/fee math
- **Ledger Engine / Settlement Engine / Reconciliation Engine** — Collection's Settlement Service
  and Ledger Service write into the same shared ledger and reconciliation infrastructure that
  Payout and Connected Banking also write into — this is exactly why a missing-ledger-debit
  defect (see [`bug-reports/`](../sample-defect-report.md)) is worth checking across products, not assumed
  to be Collection-specific
- **Merchant Onboarding / Activation** — a merchant is onboarded once at the platform level, then
  Collection-specific "Collection enablement" (see `architecture-and-flow.md`'s Admin Flow) is a
  thin product-specific layer on top
- **Audit Logs / Activity Logs / Notification Service** — Collection's own Audit Log Service and
  Activity Log Service (in `service-architecture.md`) write into the same shared logging
  infrastructure used platform-wide, which is what makes a unified, cross-product audit trail
  possible in the first place

## Platform Summary (Company-Wide Context)

| Product | Approx. Services |
|---|---|
| Collection | 38 |
| Payout | 35 |
| Connected Banking | 28 |
| Shared Platform | 28 |

**~70–80 unique logical services** across the platform in total — many shared rather than
independently reimplemented per product.

> These are approximate, company-wide framing numbers. Collection Engine's own precise,
> exhaustively-enumerated service list (40 services) is in
> [`service-architecture.md`](./service-architecture.md).

## Testing Implication: Blast Radius

When scoping regression for a change to any shared service, ask: *which other products also
depend on this service?* A change to the shared Ledger Engine, for instance, should trigger at
minimum a ledger-reconciliation smoke check across Collection, Payout, and Connected Banking —
not just the product where the change originated. Treating shared-service changes as
"local" to one product is a common source of defects that only surface in a *different* product
than the one that was actually changed.
