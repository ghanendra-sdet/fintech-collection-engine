# 💰 Fintech Collection Engine

**A merchant payment collection platform — QA & Automation Portfolio Project**

> This repository documents the QA strategy, test automation, and testing approach applied to a
> **Collection Engine** — a fintech platform that enables merchants to accept customer payments,
> track transaction lifecycles, calculate commercials, and reconcile settlements.
>
> All content here is written from first-hand QA experience but uses **generic/sample data only**.
> No client names, company names, or confidential/production information are included.
> Dates and timelines are placeholders — update `[Timeline]` before publishing.

---

## 📖 Table of Contents

1. [What is a Collection Engine?](#-what-is-a-collection-engine)
2. [My Role](#-my-role)
3. [Tech Stack & Tools Used](#-tech-stack--tools-used)
4. [Types of Testing Performed](#-types-of-testing-performed)
5. [How It Works — Business Flow](#-how-it-works--business-flow)
6. [Key Achievements](#-key-achievements)
7. [Automation Approach](#-automation-approach)
8. [Performance / Load Testing](#-performance--load-testing)
9. [Regression Checklist](#-regression-checklist)
10. [Screenshots & Reports](#-screenshots--reports)
11. [Repository Structure](#-repository-structure)

---

## 💡 What is a Collection Engine?

A **Collection Engine** is the part of a fintech/payments platform responsible for **accepting
money from customers on behalf of a merchant** and managing everything that happens to that
transaction afterward.

In plain terms: when a customer pays a merchant (via UPI, card, net banking, or wallet), the
Collection Engine is what:

- **Initiates and processes the payment** between the customer and the merchant's account
- **Tracks the transaction lifecycle** — initiated → processing → success / failed / deemed / expired
- **Calculates commercials** — the platform's fee, GST on that fee, and net payout to the merchant
- **Generates settlement records** — how much money moves to the merchant and when
- **Produces ledger entries** — an auditable trail of every debit/credit for reconciliation
- **Powers merchant-facing reporting** — dashboards, transaction search, and downloadable reports

If you're new to fintech QA, HR, or any non-technical role reading this: think of the Collection
Engine as the digital cash register **plus** the accountant. It doesn't just take the payment —
it also has to prove, to the rupee and the paisa, where that money went and what fee was charged
for the privilege of moving it.

This makes it one of the **highest business-impact modules** in any payments platform, because
defects here don't just break a screen — they can cause a merchant to be paid the wrong amount,
or a settlement report to not match the bank statement.

### Who typically interacts with it?

| Role | What they do |
|---|---|
| **Merchant** | Logs in, views dashboard, searches transactions, views settlement, downloads reports |
| **Admin / Ops** | Onboards merchants, activates collection services, configures commercials, monitors settlements, reviews audit logs |
| **Customer (end payer)** | Makes the actual payment — usually via a hosted checkout page, not this platform directly |

---

## 👤 My Role

QA Engineer / SDET responsible for the Collection Engine module, owning both manual and
automated test coverage across the transaction lifecycle.

- Owned QA strategy for Collection regression covering Login → Dashboard → Collection →
  Transaction Search → Transaction Details → Settlement → Reports
- Designed and executed **automation scripts using Playwright with TypeScript**, covering both
  UI and API layers of merchant-facing collection workflows
- Performed **API testing** validating transaction status transitions, commercial/GST
  calculations, and settlement data consistency
- Executed **performance/load testing** to validate the platform's throughput under realistic
  merchant volume (see [Performance / Load Testing](#-performance--load-testing) below)
- Logged, triaged, and tracked defects through their full lifecycle — from discovery to
  regression sign-off
- Maintained a regression checklist prioritized by financial correctness: commercials, GST,
  ledger accuracy, and settlement reconciliation

**Timeline:** `[Add Duration]`

---

## 🛠 Tech Stack & Tools Used

| Category | Tools |
|---|---|
| **UI Automation** | Playwright, TypeScript, Page Object Model |
| **API Testing** | Playwright API requests, Postman |
| **Test Runner & Reporting** | Playwright Test Runner, built-in HTML Reports |
| **Performance Testing** | JMeter |
| **CI/CD** | Jenkins / GitHub Actions |
| **Bug Tracking** | JIRA |
| **Version Control** | Git, GitHub |
| **Test Management** | TestRail / Zephyr |

---

## 🧪 Types of Testing Performed

- **Functional Testing** — merchant login, dashboard, collection flow, transaction search
- **Regression Testing** — full end-to-end suite run before every release
- **Smoke & Sanity Testing** — post-deployment health checks
- **API Testing** — transaction status, commercial/GST calculation, settlement APIs
- **Negative Testing** — invalid filters, empty search results, duplicate transaction requests
- **Performance / Load Testing** — throughput and stability validation under sustained merchant load
- **Edge Case & Boundary Testing** — commercial rounding, GST rounding, large transaction volumes

---

## 🔄 How It Works — Business Flow

> This section covers the internal QA/regression view (the screens a merchant navigates). For
> the full **end-to-end customer payment journey** — including a detailed flow for each
> collection type (UPI, QR, VAM, Payment Link, Manual Deposit), settlement, and onboarding — see
> [`docs/business-flow.md`](./docs/business-flow.md).

### Merchant Regression Flow (highest-priority end-to-end scenario)

This is the single highest-priority path through the system — nearly every release regression
run starts here. Each arrow below is annotated with what's actually being validated at that
step, since most real-world defects in this module are **data consistency issues between steps**,
not isolated screen bugs.

```
Login
  │  authenticates the merchant session
  ▼
Dashboard
  │  summary tiles (Today's Collection, Success Rate, etc.) must match live
  │  transaction data — never a stale/cached value
  ▼
Collection ──▶ UPI · QR · VAM · Payment Link · Manual Deposit
  │             5 independent initiation flows, each with its own failure
  │             surface — see docs/business-flow.md for the detailed diagrams
  ▼
Transaction Search
  │  filter by Order ID / Transaction ID / UTR / Merchant Ref / Customer / Date / Status
  ▼
Transaction Details
  │  every field (status, gateway response, amount, GST, commercial,
  │  settlement, timeline) must match the Search row exactly — no drift
  ▼
Settlement
  │  reconciles to the Ledger, net of Commercial fee + GST, correct to the paisa
  ▼
Reports
     exported totals must match Settlement + Transaction data byte-for-byte
```

> For the full customer-facing journey behind the "Collection" step — what actually happens for
> each collection type, from the customer's perspective, through to settlement — see
> [`docs/business-flow.md`](./docs/business-flow.md). For the service-level view of what's
> running behind each step above, see [`docs/service-architecture.md`](./docs/service-architecture.md).

### Admin Functions

- Merchant onboarding & activation
- Collection service enablement
- Commercial (fee) configuration
- Merchant & settlement monitoring
- Audit log review

### Cross-Module Dependencies

The Collection Engine doesn't work in isolation — conceptually it interacts with:

- **Connected Banking** — for the actual money movement
- **Commercial Engine** — for fee/GST calculation
- **Settlement & Ledger** — for reconciliation
- **Admin Portal** — for configuration and monitoring
- **Reporting** — for merchant and internal analytics

---

## 🏆 Key Achievements

- Owned QA coverage across Collection Engine's **~40-service architecture** — including five
  dedicated collection-type services (UPI, QR, VAM, Payment Link, Manual Deposit), settlement,
  commercial/GST calculation, and reporting/analytics services (see
  [Service Architecture](./docs/service-architecture.md) for the full breakdown)
- Designed integration test coverage across service boundaries most prone to drift — e.g.
  Settlement Calculation Service → Ledger Service — where a historically common defect theme
  (missing ledger debit entries) originates
- Managed and tracked **300+ defects** end-to-end (identification → triage → regression
  verification)
- Built and maintained an automated regression suite in Playwright/TypeScript covering the
  highest-priority merchant journey (Login → Reports)
- Identified and helped resolve recurring defect themes: missing ledger debit fees, commercial
  calculation mismatches, and GST rounding discrepancies — all high financial-impact issues
- Contributed to a testing strategy that prioritized **financial correctness first** — commercial
  accuracy, ledger consistency, and settlement reconciliation — ahead of purely cosmetic UI issues

---

## 🤖 Automation Approach

Automation for the Collection Engine is built with **Playwright + TypeScript**, using the **Page
Object Model** to keep locators and workflows maintainable as the UI evolves.

- **Framework:** Playwright Test Runner
- **Language:** TypeScript
- **Pattern:** Page Object Model (POM) — one class per major screen (Dashboard, Collection,
  Transaction Search, Transaction Details, Settlement, Reports)
- **Reporting:** Playwright's built-in HTML report, published as a build artifact
- **CI Integration:** Designed to run headless in Jenkins/GitHub Actions on every merge to main

### High-Priority Automated Regression Scenarios

1. Login
2. Dashboard
3. Collection
4. Transaction Search
5. Transaction Details
6. Settlement

See [`automation/`](./automation) for the framework README and a sample spec file using dummy
merchant data.

---

## 📈 Performance / Load Testing

Sample load test results (dummy/representative figures for portfolio purposes — a separate,
illustrative exercise from the real Connected Banking load test documented elsewhere in this
portfolio):

| Metric | Result |
|---|---|
| Tool | JMeter |
| Test Duration | 3 hours |
| Merchants Simulated | 40 |
| Total Transactions | 180,000 |
| Stable Throughput | ~45 TPS |
| Error Rate | 0.01% |
| P90 Latency | 95 ms |
| P95 Latency | 240 ms |
| P99 Latency | 900 ms |

**Observation:** Under sustained load, database connection pool saturation became the limiting
factor before application logic did — a common pattern worth flagging early in capacity planning
conversations with engineering.

See [`test-reports/`](./test-reports) for the full sample performance report.

---

## ✅ Regression Checklist

- [ ] Login
- [ ] Dashboard
- [ ] Merchant Profile
- [ ] Collection
- [ ] Transaction Search
- [ ] Transaction Details
- [ ] Settlement
- [ ] Reports
- [ ] Downloads / Export
- [ ] Commercial Calculation
- [ ] GST Calculation
- [ ] Ledger Entries
- [ ] Permissions / Role-Based Access

Full checklist with edge cases available in [`test-cases/`](./test-cases).

---

## 📸 Screenshots & Reports

Sample test execution reports, defect report templates, and performance test summaries are
available under [`test-reports/`](./test-reports) and [`bug-reports/`](./bug-reports).

---

## 📁 Repository Structure

```
collection-engine/
├── README.md                     → This file
├── docs/
│   ├── business-overview.md      → What Collection Engine is, glossary, cross-module map
│   ├── architecture-and-flow.md  → Internal QA/regression flow diagrams (dashboard, admin, states)
│   ├── business-flow.md          → End-to-end customer payment journey per collection type, settlement, onboarding
│   ├── feature-modules.md        → Full feature/screen inventory (Dashboard, Search, Collection Types, Reports)
│   ├── service-architecture.md   → Microservice-level decomposition & integration test boundaries
│   └── shared-platform-services.md → Company-wide services this product depends on (Auth, GST/Ledger/Settlement Engines, etc.)
├── test-cases/
│   └── regression-checklist.md   → Full regression suite + edge cases
├── automation/
│   ├── README.md                 → Framework setup & structure
│   └── sample-collection.spec.ts → Sample Playwright + TypeScript test (dummy data)
├── bug-reports/
│   └── sample-defect-report.md   → Defect report template with dummy example
└── test-reports/
    └── performance-test-summary.md → Sample JMeter load test report
```

> **Suggestion:** if you want this repo to double as a learning resource for someone new to
> fintech QA, keep `docs/business-overview.md` as the "start here" link at the top of the README
> — non-QA readers (HR, hiring managers, other engineers) will get oriented fastest there before
> diving into test cases or automation code.
