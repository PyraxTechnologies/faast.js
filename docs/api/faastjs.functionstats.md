[Home](./index) &gt; [faastjs](./faastjs.md) &gt; [FunctionStats](./faastjs.functionstats.md)

## FunctionStats class

Summary statistics for function invocations.

<b>Signature:</b>

```typescript
export declare class FunctionStats 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [completed](./faastjs.functionstats.completed.md) |  | `number` | The number of invocations that were successfully completed. |
|  [errors](./faastjs.functionstats.errors.md) |  | `number` | The number of invocations that resulted in an error. If an invocation is retried, an error is only counted once, no matter how many retries were attempted. |
|  [estimatedBilledTime](./faastjs.functionstats.estimatedbilledtime.md) |  | `Statistics` | Statistics for amount of time billed. This is similar to [FunctionStats.executionTime](./faastjs.functionstats.executiontime.md) except each sampled time is rounded up to the next 100ms. |
|  [executionTime](./faastjs.functionstats.executiontime.md) |  | `Statistics` | Statistics for how long a function executes. This is measured as wall clock time, and does not include the time taken to send the response to the response queue. |
|  [invocations](./faastjs.functionstats.invocations.md) |  | `number` | The number of invocations attempted. If an invocation is retried, this only counts the invocation once. |
|  [localStartLatency](./faastjs.functionstats.localstartlatency.md) |  | `Statistics` | Statistics for how long invocations stay in the local queue before being sent to the cloud provider. |
|  [remoteStartLatency](./faastjs.functionstats.remotestartlatency.md) |  | `Statistics` | Statistics for how long requests take to start execution after being sent to the cloud provider. This typically includes remote queueing and cold start times. Because this measurement requires comparing timestamps from different machines, it is subject to clock skew and other effects, and should not be considered highly accurate. It can be useful for detecting excessively high latency problems. Faast.js attempt to correct for clock skew heuristically. |
|  [retries](./faastjs.functionstats.retries.md) |  | `number` | The number of invocation retries attempted. This counts retries attempted by faast.js to recover from transient errors, but does not count retries by the cloud provider. |
|  [returnLatency](./faastjs.functionstats.returnlatency.md) |  | `Statistics` | Statistics for how long it takes to return a response from the end of execution time to the receipt of the response locally. This measurement requires comparing timestamps from different machines, and is subject to clock skew and other effects. It should not be considered highly accurate. It can be useful for detecting excessively high latency problems. Faast.js attempts to correct for clock skew heuristically. |
|  [sendResponseLatency](./faastjs.functionstats.sendresponselatency.md) |  | `Statistics` | Statistics for how long it takes to send the response to the response queue. |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [toString()](./faastjs.functionstats.tostring.md) |  |  |

## Remarks


```
              localStartLatency      remoteStartLatency      executionTime
            ◀──────────────────▶◁ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ▷◀──────────▶

┌───────────────────────────────────┬──────────────────────────────────────┐
│                                   │                                      │
│               Local               │            Cloud Provider            │
│                                   │                                      │
│                    ┌─────────┐    │   ┌──────────┐         ┌──────────┐  │
│                    │         │    │   │          │         │          │  │
│                    │  local  │    │   │ request  │         │          │  │
│   invoke  ────────▶│  queue  │────┼──▶│  queue   ├────────▶│          │  │
│                    │         │    │   │          │         │          │  │
│                    └─────────┘    │   └──────────┘         │  cloud   │  │
│                                   │                        │ function │  │
│                    ┌─────────┐    │   ┌──────────┐         │          │  │
│                    │         │    │   │          │         │          │  │
│   result  ◀────────│  local  │◀───┼───│ response │◀────────│          │  │
│                    │ polling │    │   │  queue   │         │          │  │
│                    │         │    │   │          │         │          │  │
│                    └─────────┘    │   └──────────┘         └──────────┘  │
│                                   │                                      │
└───────────────────────────────────┴──────────────────────────────────────┘

            ◁ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ▷
                     returnLatency                  ◀───────▶
                                                    sendResponseLatency

```
`localStartLatency` and `executionTime` are measured on one machine and are free of clock skew. `remoteStartLatency` and `returnLatency` are measured as time differences between machines and are subject to much more uncertainty, and effects like clock skew.
