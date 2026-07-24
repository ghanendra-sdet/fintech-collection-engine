# Collection Engine — Architecture & Flow

> This is the internal, system-level "Tech Flow" view — state machines, admin flow, service
> interaction. For the customer/merchant-facing journey, see [`business-flow.md`](./business-flow.md).
> For the service-level (microservice) view behind these diagrams, see
> [`service-architecture.md`](./service-architecture.md). See [`README.md`](./README.md) for the
> full documentation map.

## Merchant Regression Flow (Primary End-to-End Scenario)

This is the single highest-priority path through the system — nearly every release regression
run starts here:

```
┌────────┐   ┌───────────┐   ┌────────────┐   ┌─────────────────────┐
│ Login  │──▶│ Dashboard │──▶│ Collection │──▶│ Transaction Search   │
└────────┘   └───────────┘   └────────────┘   └──────────┬───────────┘
                                                          │
                                                          ▼
                                              ┌───────────────────────┐
                                              │ Transaction Details   │
                                              └──────────┬────────────┘
                                                          │
                                                          ▼
                                                  ┌───────────────┐
                                                  │  Settlement   │
                                                  └───────┬───────┘
                                                          │
                                                          ▼
                                                    ┌───────────┐
                                                    │  Reports  │
                                                    └───────────┘
```

## Admin Flow

```
Merchant Onboarding ──▶ Merchant Activation ──▶ Collection Enablement
                                                        │
                                                        ▼
                                          Commercial Configuration
                                                        │
                                                        ▼
                                    Merchant / Settlement Monitoring
                                                        │
                                                        ▼
                                                  Audit Logs
```

## Transaction Lifecycle States

```
INITIATED ──▶ PROCESSING ──┬──▶ SUCCESS
                            ├──▶ FAILED
                            ├──▶ DEEMED
                            └──▶ EXPIRED
```

- **SUCCESS** — payment completed, funds move toward settlement
- **FAILED** — payment rejected (e.g. insufficient funds, invalid VPA)
- **DEEMED** — payment status uncertain at the payment gateway/bank, requires reconciliation
- **EXPIRED** — payment window closed without a definitive response

## System Interaction Map

```
                ┌────────────────────┐
                │  Connected Banking │
                └─────────┬──────────┘
                          │ money movement
                          ▼
   ┌────────────┐   ┌───────────────────┐   ┌────────────────────┐
   │  Merchant  │──▶│ Collection Engine │──▶│ Commercial Engine   │
   │ (customer  │   │                   │   │ (fee + GST calc)    │
   │  payment)  │   └─────────┬──────────┘   └─────────┬───────────┘
   └────────────┘             │                        │
                               ▼                        ▼
                      ┌─────────────────┐      ┌─────────────────┐
                      │ Settlement &    │◀─────│     Ledger      │
                      │ Reconciliation  │      │  (audit trail)  │
                      └─────────┬────────┘      └─────────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │   Reporting   │
                        └───────────────┘
```

## Why the Flow Order Matters for Testing

Each step in the merchant flow builds state that the next step depends on:

1. **Login** establishes the authenticated merchant session
2. **Dashboard** surfaces a summary that must match underlying transaction data
3. **Collection** is where new transactions are created/viewed
4. **Transaction Search** must correctly filter by status, date, and amount
5. **Transaction Details** must show the exact same data as search results — no drift
6. **Settlement** must reconcile to the transaction totals exactly
7. **Reports** must match settlement and transaction data byte-for-byte on export

This is why the regression suite (manual and automated) always walks this path in order rather
than testing each screen in isolation — most real-world defects in this module are **data
consistency issues between steps**, not isolated UI bugs.

**See also:** these steps are also where cross-screen [UI consistency](./ui-consistency.md)
issues surface most often (Section 4 above shows the same data on multiple screens); the concrete
test cases derived from this flow live in [`../regression-checklist.md`](../regression-checklist.md).
