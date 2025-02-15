<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [NS](./bitburner.ns.md) &gt; [growthAnalyzeSecurity](./bitburner.ns.growthanalyzesecurity.md)

## NS.growthAnalyzeSecurity() method

Calculate the security increase for a number of threads.

**Signature:**

```typescript
growthAnalyzeSecurity(threads: number, hostname?: string, cores?: number): number;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  threads | number | Amount of threads that will be used. |
|  hostname | string | _(Optional)_ Optional. Hostname of the target server. The number of threads is limited to the number needed to hack the server's maximum amount of money. |
|  cores | number | _(Optional)_ Optional. The number of cores of the server that would run grow. |

**Returns:**

number

The security increase.

## Remarks

RAM cost: 1 GB

Returns the security increase that would occur if a grow with this many threads happened.

