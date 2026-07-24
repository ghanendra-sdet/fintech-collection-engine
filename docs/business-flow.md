# Collection Engine — User & Business Flow

> While [`architecture-and-flow.md`](./architecture-and-flow.md) documents the internal QA/
> regression path through the merchant dashboard, this document covers the **actual end-to-end
> business flow** — what happens from the moment a merchant requests payment to the moment funds
> settle, from every actor's point of view (Customer, Merchant, Platform, Bank).

## Actors

| Actor | Role in the flow |
|---|---|
| **Customer** | The end payer — the person actually sending money |
| **Merchant** | The business requesting payment, monitoring status, and receiving settled funds |
| **Collection Engine** | Orchestrates the request, tracks status, calculates commercials, triggers settlement |
| **Payment Gateway / Bank Rail** | The external system that actually moves money (UPI switch, bank, card network) |
| **Commercial & Ledger Services** | Calculate fees/GST and record the auditable financial trail |

---

## 1. End-to-End Business Flow (High Level)

```
Merchant requests payment
        │
        ▼
Collection Engine creates a transaction (status: INITIATED)
        │
        ▼
Customer completes payment via chosen method
   (UPI / QR / VAM / Payment Link / Manual Deposit)
        │
        ▼
Payment Gateway / Bank confirms or rejects the payment
        │
        ▼
Collection Engine receives callback/webhook, updates status
   (SUCCESS / FAILED / DEEMED / EXPIRED)
        │
        ▼
Commercial Engine calculates fee + GST on successful transactions
        │
        ▼
Ledger records the transaction and fee entries
        │
        ▼
Settlement Service batches successful transactions on a schedule
        │
        ▼
Funds settle to the merchant's bank account
        │
        ▼
Merchant sees updated balance, transaction history, and reports
```

**Testing implication:** the customer-facing half of this flow (everything before the callback)
is largely outside the platform's direct control — the platform's job is to handle *every*
possible outcome from that half gracefully, not just the success case.

---

## 2. Business Flow by Collection Type

Each collection type has a meaningfully different customer experience and failure surface.

### 2.1 UPI Collection

```
Merchant initiates UPI collection request (amount + customer VPA or open intent)
        │
        ▼
Collection Engine generates a UPI collect request / intent
        │
        ▼
Customer receives a UPI approval request in their UPI app
        │
        ├──▶ Customer approves ──▶ Bank debits customer, credits platform's pool account
        │                                  │
        │                                  ▼
        │                          Success callback received
        │
        ├──▶ Customer declines ──▶ Failure callback received
        │
        └──▶ Customer takes no action ──▶ Request expires ──▶ EXPIRED status
```

**Key test scenarios:** approval, decline, timeout/no-action, invalid VPA at request time,
customer's bank being temporarily down.

### 2.2 QR Collection

```
Merchant displays a dynamic QR (amount pre-filled) or static QR (customer enters amount)
        │
        ▼
Customer scans QR with any UPI-enabled app
        │
        ▼
Customer approves payment in their own banking/UPI app
        │
        ▼
Same success/decline/expiry paths as UPI Collection
```

**Key test scenarios:** dynamic vs. static QR amount handling, QR expiry, scanning an
already-paid/expired QR a second time (must not double-charge or silently succeed).

### 2.3 Virtual Account (VAM) Collection

```
Merchant is assigned a dedicated Virtual Account Number (VAN) per customer or per purpose
        │
        ▼
Customer transfers funds directly to the VAN via NEFT/IMPS/RTGS from their own bank
        │
        ▼
Bank notifies the platform of a credit to that VAN
        │
        ▼
Collection Engine matches the credit to the correct merchant/customer via the VAN mapping
        │
        ▼
Transaction marked SUCCESS — no "decline" path exists here (funds already moved)
```

**Key test scenarios:** VAN-to-merchant mapping accuracy (a wrong mapping misattributes real
money), partial/over/under-payment against an expected amount, delayed bank notification.

### 2.4 Payment Link Collection

```
Merchant generates a payment link (amount fixed or customer-entered)
        │
        ▼
Merchant shares the link (SMS/email/chat) with the customer
        │
        ▼
Customer opens the link — a hosted payment page
        │
        ▼
Customer chooses a method on that page (UPI / card / net banking, depending on what's enabled)
        │
        ▼
Standard success/decline/expiry paths, same as the underlying method chosen
```

**Key test scenarios:** link expiry, link reuse after successful payment (must not allow a
second charge), link accessed on an unsupported device/browser.

### 2.5 Manual Deposit

```
Customer deposits cash/cheque directly at a bank branch or ATM, referencing the merchant's account
        │
        ▼
No real-time callback exists — this is the one collection type without an automated confirmation
        │
        ▼
Merchant or platform ops manually uploads/reconciles proof of deposit (e.g. a deposit slip reference)
        │
        ▼
Transaction manually marked SUCCESS after reconciliation
```

**Key test scenarios:** this is the highest manual-error-risk collection type — test that a
manually-entered amount matches supporting proof, that duplicate manual entries are prevented,
and that manually-reconciled transactions still flow correctly into settlement and reporting
alongside automated ones.

---

## 3. Settlement Business Flow (What Happens After Success)

```
Successful transactions accumulate against a merchant
        │
        ▼
Settlement Schedule Service triggers a settlement cycle (e.g. T+1, daily batch)
        │
        ▼
Settlement Calculation Service sums eligible transactions, subtracts commercial + GST
        │
        ▼
Ledger records the settlement debit/credit entries
        │
        ▼
Funds are transferred to the merchant's linked bank account
        │
        ▼
Settlement Report becomes available, reconciling to the transaction-level data
```

**Key test scenarios:** a transaction that succeeds *after* a settlement cycle has already run
must correctly roll into the *next* cycle, never get silently dropped; a failed/reversed
transaction discovered after settlement needs a defined reconciliation path.

---

## 4. Merchant Onboarding Business Flow (Before Any of the Above Is Possible)

```
Merchant signs up
        │
        ▼
Merchant Verification (KYC/KYB, PAN, business documents)
        │
        ▼
Admin approval
        │
        ▼
Collection service activation
        │
        ▼
Commercial configuration assigned (fee slabs, GST handling)
        │
        ▼
Merchant can now initiate live collections
```

---

## 5. Why This View Matters for Test Design

The regression-path view in `architecture-and-flow.md` answers *"does the dashboard correctly
show what already happened?"* — this document answers *"does the system correctly handle
everything that can happen on the way there?"* Both are necessary: a platform can have a
flawless dashboard and still lose merchant trust if, say, a Payment Link can be paid twice, or a
VAM credit gets matched to the wrong customer. The failure branches documented above (declines,
expiries, mismatches, manual-entry errors) are exactly where the highest-value, hardest-to-find
defects tend to live — and are the primary source for the edge cases listed in
[`test-cases/regression-checklist.md`](../regression-checklist.md).
