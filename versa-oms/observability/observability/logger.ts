import type { AppLogEvent } from "./types";
import { redactObject } from "./redact";

export function logEvent(event: Omit<AppLogEvent, "timestamp" | "redaction_applied">) {
  const safeContext = event.safe_context ? redactObject(event.safe_context) : {};

  const payload: AppLogEvent = {
    ...event,
    timestamp: new Date().toISOString(),
    safe_context: safeContext,
    redaction_applied: true
  };

  // Replace console output with structured logger provider.
  // Never log raw request body or signed URLs.
  console.log(JSON.stringify(payload));
}
