// Staff upload-on-behalf: POST a roster file to ingest into a batch. Custom sub-route
// (the generic gen_modules routes don't cover file ingestion). Engine + scope + audit
// live in @/server/roster/*. staff_upload_policy.json: reason required, audited.
import { makeRosterIngestHandler } from "@/server/roster/ingestHandlers";

export const { POST } = makeRosterIngestHandler("student_roster_ops", "staff");
