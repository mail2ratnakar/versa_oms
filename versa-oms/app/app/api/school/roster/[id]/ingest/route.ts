import { makeRosterIngestHandler } from "@/server/roster/ingestHandlers";

export const { POST } = makeRosterIngestHandler("school_roster", "school");
