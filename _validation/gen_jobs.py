#!/usr/bin/env python3
"""Generate server/jobs/registry.generated.ts from the worker spec
(JOB_REGISTRY.json + QUEUE_CONFIG.json)."""
import json
from pathlib import Path

W = Path("versa-oms/workers")
jr = json.loads((W/"JOB_REGISTRY.json").read_text(encoding="utf-8"))
qc = json.loads((W/"QUEUE_CONFIG.json").read_text(encoding="utf-8"))
jobs = jr.get("jobs", [])
policy = qc.get("default_policy", {})

defs = {}
for j in jobs:
    jt = j.get("job_type")
    if not jt: continue
    defs[jt] = {
        "jobType": jt,
        "queueId": j.get("queue_id", "default"),
        "ownerModule": j.get("owner_module", ""),
        "risk": j.get("risk", "medium"),
    }

out = Path("versa-oms/app/server/jobs/registry.generated.ts")
out.parent.mkdir(parents=True, exist_ok=True)
lines = [
 "// AUTO-GENERATED from workers/JOB_REGISTRY.json + QUEUE_CONFIG.json. Do not edit by hand.",
 "export type JobDef = { jobType: string; queueId: string; ownerModule: string; risk: string };",
 "",
 "export const JOB_REGISTRY: Record<string, JobDef> = " + json.dumps(defs, indent=2) + ";",
 "",
 "export const QUEUE_POLICY = {",
 f"  idempotencyRequired: {str(policy.get('idempotency_required', True)).lower()},",
 f"  deadLetterEnabled: {str(policy.get('dead_letter_enabled', True)).lower()},",
 f"  auditHighRisk: {str(policy.get('audit_required_for_high_risk', True)).lower()},",
 "  maxAttempts: 3,",
 "};",
 "",
 "export function isHighRisk(jobType: string): boolean {",
 "  const d = JOB_REGISTRY[jobType];",
 "  return !!d && (d.risk === 'critical' || d.risk === 'high');",
 "}",
]
out.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"wrote {out} with {len(defs)} job types across queues:",
      sorted({d['queueId'] for d in defs.values()}))
