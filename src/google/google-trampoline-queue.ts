import { google, pubsub_v1 } from "googleapis";
import { createErrorResponse, FunctionCall, Wrapper } from "../wrapper";
import { publishResponseMessage } from "./google-queue";
import { getExecutionLogUrl } from "./google-shared";
import PubSubApi = pubsub_v1;

export const filename = module.filename;

export interface CloudFunctionContext {
    eventId: string;
    timestamp: string;
    eventType: string;
    resource: object;
}

let pubsub: PubSubApi.Pubsub;
type PubsubMessage = PubSubApi.Schema$PubsubMessage;

async function initialize() {
    if (!pubsub) {
        const auth = await google.auth.getClient({
            scopes: ["https://www.googleapis.com/auth/cloud-platform"]
        });
        google.options({
            auth,
            retryConfig: {
                retry: 6,
                statusCodesToRetry: [[100, 199], [429, 429], [405, 405], [500, 599]]
            }
        });
        pubsub = google.pubsub("v1");
    }
}

export function makeTrampoline(wrapper: Wrapper) {
    async function trampoline(data: PubsubMessage, context: CloudFunctionContext) {
        const startTime = Date.now();
        await initialize();

        const executionId = context.eventId;
        const project = process.env["GCP_PROJECT"]!;
        const functionName = process.env["FUNCTION_NAME"]!;
        const logUrl = getExecutionLogUrl(project, functionName, executionId);
        const str = Buffer.from(data.data!, "base64");
        const call: FunctionCall = JSON.parse(str.toString()) as FunctionCall;

        const { callId, ResponseQueueId } = call;
        const startedMessageTimer = setTimeout(
            () =>
                publishResponseMessage(pubsub, ResponseQueueId!, {
                    kind: "functionstarted",
                    callId
                }),
            2 * 1000
        );

        const callingContext = {
            call,
            startTime,
            logUrl,
            executionId
        };

        try {
            const deadline =
                Date.parse(context.timestamp) + wrapper.options.childProcessTimeoutMs;
            const result = await wrapper.execute(
                callingContext,
                metrics =>
                    publishResponseMessage(pubsub, ResponseQueueId!, {
                        kind: "cpumetrics",
                        callId,
                        metrics
                    }),
                deadline - Date.now()
            );
            clearTimeout(startedMessageTimer);
            await publishResponseMessage(pubsub, call.ResponseQueueId!, {
                kind: "response",
                callId,
                body: result.serialized || result.returned
            });
        } catch (err) {
            console.error(err);
            if (ResponseQueueId) {
                await publishResponseMessage(pubsub, call.ResponseQueueId!, {
                    kind: "response",
                    callId,
                    body: createErrorResponse(err, callingContext)
                });
            }
        }
    }
    return { trampoline };
}
