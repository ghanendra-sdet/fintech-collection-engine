# Collection Engine — Documentation Map

> If you're approaching this repo the way a curious QA engineer, automation tester, or
> tech-enthusiast would — "what is this, how does it actually work, who's involved, what does it
> depend on, what's the difference between the business flow and the technical flow" — this page
> answers that directly, one question at a time, with a link to where the real answer lives.

| Your Question | Answer Lives In |
|---|---|
| **What is this, in plain terms?** | [`business-overview.md`](./business-overview.md) — the "start here" doc: what problem it solves, business objectives, why it's high-risk |
| **Who's involved? (Stakeholders)** | [`business-overview.md`](./business-overview.md) section 3 — Merchant, Customer, Admin/Ops, Finance, Compliance, Support, and more |
| **What does it depend on?** | [`shared-platform-services.md`](./shared-platform-services.md) (company-wide shared engines) + [`service-architecture.md`](./service-architecture.md) (this product's own ~40 services) |
| **How does it work, technically?** (Tech Flow) | [`architecture-and-flow.md`](./architecture-and-flow.md) — internal state machines, admin flow, system interaction map — plus [`service-architecture.md`](./service-architecture.md) for the microservice-level view |
| **What does the customer/merchant actually experience?** (Business Flow + User Flow) | [`business-flow.md`](./business-flow.md) — the real end-to-end journey per collection type (UPI/QR/VAM/Payment Link/Manual Deposit), from the customer's and merchant's point of view |
| **What screens/fields exist?** | [`feature-modules.md`](./feature-modules.md) — the concrete UI inventory every flow above maps onto |
| **Does the UI behave consistently everywhere?** | [`ui-consistency.md`](./ui-consistency.md) — status badges, formatting, terminology, accessibility, cross-browser/responsive behavior |
| **What's actually tested?** | [`../regression-checklist.md`](../regression-checklist.md) — the full suite, cross-referenced to every doc above |
| **What's been automated?** | [`../automation/`](../automation) |
| **What real defects has this surfaced?** | [`../sample-defect-report.md`](../sample-defect-report.md) |
| **How does it perform under load?** | [`../performance-test-summary.md`](../performance-test-summary.md) |

## Reading Order (Recommended)

If you're reading this repo end-to-end for the first time, this is the order that builds
understanding most naturally — each doc assumes you've absorbed the ones before it:

```
1. business-overview.md        ← the "why" — what problem, who's involved, what's high-risk
        │
        ▼
2. business-flow.md            ← the "what happens" — customer/merchant journey, per collection type
        │
        ▼
3. feature-modules.md          ← the "where" — concrete screens and fields
        │
        ▼
4. architecture-and-flow.md    ← the "how" (system-level) — state machines, admin flow
        │
        ▼
5. service-architecture.md     ← the "how" (service-level) — microservice decomposition
        │
        ▼
6. shared-platform-services.md ← the "what it shares" — company-wide dependencies
        │
        ▼
7. ui-consistency.md           ← the "does it hold together" — cross-screen UI consistency
        │
        ▼
8. regression-checklist.md, automation/, sample-defect-report.md, performance-test-summary.md   ← the proof — coverage, automation, real findings, real numbers
```

## Business Flow vs. Tech Flow vs. User Flow — What's the Difference Here?

These three terms get used loosely, so here's how this repo draws the line:

- **Business Flow** ([`business-flow.md`](./business-flow.md)) — the *why* and *what* from a
  business-process point of view: a merchant requests payment, a customer pays, money moves,
  fees get calculated, funds settle. Written for anyone regardless of technical background.
- **User Flow** — the same ground as Business Flow, but from the *actor's* point of view
  specifically — what a customer clicks/taps/approves at each collection-type-specific step
  (UPI approval, QR scan, VAM transfer, Payment Link checkout, Manual Deposit reconciliation).
  Covered inside `business-flow.md` sections 2.1–2.5, not a separate document, since in this
  product the user flow *is* the business flow at the collection-type level.
- **Tech Flow** ([`architecture-and-flow.md`](./architecture-and-flow.md) +
  [`service-architecture.md`](./service-architecture.md)) — the *how*, internally: state
  machines, which service owns which responsibility, integration boundaries between services.
  Written for QA/engineering audiences designing test coverage or debugging a defect's likely
  origin.

If you only read one document to understand "how this product works" end-to-end as a newcomer,
read `business-overview.md` first, then `business-flow.md`.
