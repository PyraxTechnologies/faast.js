[Home](./index) &gt; [faastjs](./faastjs.md) &gt; [FaastModule](./faastjs.faastmodule.md) &gt; [logUrl](./faastjs.faastmodule.logurl.md)

## FaastModule.logUrl() method

The URL of logs generated by this cloud function.

<b>Signature:</b>

```typescript
logUrl(): string;
```
<b>Returns:</b>

`string`

## Remarks

Logs are not automatically downloaded because they cause outbound data transfer, which can be expensive. Also, logs may arrive at the logging service well after the cloud functions have completed. This log URL specifically filters the logs for this cloud function instance. Authentication is required to view cloud provider logs.

The local provider returns a `file://` url pointing to a file for logs.
