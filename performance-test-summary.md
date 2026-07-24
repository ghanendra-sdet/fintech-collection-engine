# Collection Engine — Performance / Load Test Summary (Sample)

> Representative load test report for portfolio purposes. Figures are illustrative of a real
> test structure and scale, not tied to any specific company's production environment — and
> intentionally distinct from the real Connected Banking load test documented elsewhere in this
> portfolio, since Collection Engine and Connected Banking are separate products with separate
> performance profiles.

## Test Configuration

| Parameter | Value |
|---|---|
| Tool | Apache JMeter |
| Test Type | Sustained Load / Soak Test |
| Duration | 3 hours |
| Merchants Simulated | 40 |
| Total Transactions Generated | 180,000 |
| Target Throughput | 45 TPS |

## Results

| Metric | Result |
|---|---|
| Stable Throughput Achieved | ~42 TPS – ~45 TPS |
| Peak Throughput Validated | ~60 TPS |
| Error Rate | 0.01% |
| P90 Latency | 95 ms |
| P95 Latency | 240 ms |
| P99 Latency | 900 ms |
| Uptime During Test | 99.9%+ |

## Bottleneck Analysis

The application layer sustained target throughput comfortably. The limiting factor observed was
**database connection pool saturation** under sustained load — as concurrent settlement
calculation queries grew during traffic spikes, the connection pool became the bottleneck before
the application's own processing capacity was exhausted.

**Recommendation:** size the database connection pool for peak-hour traffic patterns, not
average throughput, and add connection-pool-utilization alerting ahead of saturation.

## Test Coverage During Load Run

- Login
- Collection initiation (UPI)
- Transaction status polling
- Dashboard refresh under concurrent merchant sessions
- Settlement calculation under load

## Conclusion

The Collection Engine met its throughput target under a 3-hour sustained load test across 40
simulated merchants and 180K+ transactions, with error rates well within acceptable limits
(0.01%). The primary scaling consideration going forward is infrastructure-level (database
connection pool sizing) rather than application logic.

**See also:** [`docs/service-architecture.md`](./docs/service-architecture.md) for which
services sit on this load path, and [`README.md`](./README.md#-key-achievements) for how this
result feeds into the Key Achievements summary.
