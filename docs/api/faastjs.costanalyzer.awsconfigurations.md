---
id: faastjs.costanalyzer.awsconfigurations
title: CostAnalyzer.awsConfigurations variable
hide_title: true
---
[faastjs](./faastjs.md) &gt; [CostAnalyzer](./faastjs.costanalyzer.md) &gt; [awsConfigurations](./faastjs.costanalyzer.awsconfigurations.md)

## CostAnalyzer.awsConfigurations variable

Default AWS cost analyzer configurations include all memory sizes for AWS Lambda.

<b>Signature:</b>

```typescript
awsConfigurations: Configuration[]
```

## Remarks

The default AWS cost analyzer configurations include every memory size from 128MB to 3008MB in 64MB increments. Each configuration has the following settings:

```typescript
{
    provider: "aws",
    options: {
        mode: "https",
        memorySize,
        timeout: 300,
        gc: false,
        childProcess: true
    }
}

```
Use `Array.map` to change or `Array.filter` to remove some of these configurations. For example:

```typescript
const configsWithAtLeast1GB = awsConfigurations.filter(c => c.memorySize > 1024)
const shorterTimeout = awsConfigurations.map(c => ({...c, timeout: 60 }));

```