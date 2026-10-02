# Sample Requirement Traceability Matrix — Collection Engine

> Worked example using dummy data. An RTM is referenced throughout this portfolio as a core QA
> artifact — this is what that artifact actually looks like, not just a claim that it exists.
> See [`docs/README.md`](./docs/README.md) for the full documentation map.

## What an RTM Is Actually For

A regression checklist (see [`regression-checklist.md`](./regression-checklist.md)) answers
"what do we test." An RTM answers a different, equally important question: **"does every
business requirement have test coverage, and is that coverage actually sufficient?"** The two
documents look similar but serve different purposes — a checklist is organized by test area; an
RTM is organized by *requirement*, which is what makes it the tool that actually catches a
requirement with **no** test coverage at all, not just a weakly-tested one.

## The Matrix

| Req ID | Requirement (from a sample sprint story) | Linked Test Case(s) | Automation Status | Coverage Status |
|---|---|---|---|---|
| REQ-801 | Dashboard totals match underlying transaction data exactly | TC-003 | Automated | ✅ Covered |
| REQ-802 | Every collection type (UPI/QR/VAM/Payment Link/Manual Deposit) handles its own failure surface correctly | TC-021–039 | Mixed | ✅ Covered |
| REQ-803 | A successful transaction produces a matching ledger debit entry for its commercial fee | TC-014 | Manual | ✅ Covered — this is the exact requirement `BUG-COL-1042` violated |
| REQ-804 | Settlement amount reconciles to the paisa against transaction totals minus commercial | TC-008 | Automated | ✅ Covered |
| REQ-805 | GST rounding is applied by one consistent rule, identically in the UI and in exported reports | TC-013 | Manual | ⚠️ Partial — the expected result states both should match, but the test case doesn't explicitly cross-check the UI's displayed value against the downloaded report's value for the same transaction; this is the exact gap `BUG-COL-1078` fell into |
| REQ-806 | Settlement Report totals equal the Ledger's own totals for the same date range, including after a transaction reversal | TC-020 | Manual | ✅ Covered — this is the exact requirement `BUG-COL-1105` violated |
| REQ-807 | A late-succeeding transaction after a settlement cutoff rolls into the next cycle, never silently dropped | TC-040 | Manual | ✅ Covered |
| REQ-808 | Status badges are identical across Dashboard, Search, Details, and Reports for the same transaction | TC-059 | Manual | ✅ Covered |
| REQ-809 | The platform degrades gracefully (queues/retries) rather than failing transactions outright when the database connection pool saturates under load | — | — | ❌ **Gap — the real JMeter soak test (`performance-test-summary.md`) found connection-pool saturation as the limiting factor, but no functional regression test confirms what actually happens to an individual transaction attempted at that moment** |

## What the Gap Actually Caught

This is the part a checklist alone wouldn't surface, because a checklist only tells you about the
tests that already exist:

- **REQ-809** is a gap this RTM only caught because it reads the real performance test result
  (not a hypothetical one) as a *requirement*, not just an infrastructure observation. The
  bottleneck analysis in [`performance-test-summary.md`](./performance-test-summary.md) correctly
  identifies connection-pool saturation as the limiting factor under sustained load — but that
  document stops at the infrastructure recommendation ("size the pool for peak-hour patterns").
  It never asks the functional-QA follow-up question: when the pool *is* saturated, what actually
  happens to the merchant's transaction in flight at that exact moment — does it queue and
  eventually succeed, retry transparently, or fail outright with a clear error? None of the 64
  cases in [`regression-checklist.md`](./regression-checklist.md) answer that, because it's a
  functional question that only became visible *after* the performance test surfaced the
  bottleneck in the first place. Raised as a new story (illustrative ID `COL-4021`): add a
  regression case that deliberately saturates the connection pool (or mocks that condition) and
  asserts the in-flight transaction's actual outcome is well-defined, not merely "the system
  recovered" at an aggregate level.

**The general pattern:** an RTM's value isn't the rows that say "Covered" — those just confirm
existing test design. Its value is specifically the rows that say "Gap" or "Partial," because
those are the requirements a test-case-first workflow (write tests, forget to check them against
the original requirement list) would never have surfaced on its own — including, in this case,
a gap that only became visible after reading a *performance* result as a functional requirement.
