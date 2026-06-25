// Staff secure download of a roster's original source file (FR-SECURE-FILE-DOWNLOAD-0003).
// Custom sub-route; scope + signed-URL + audit live in the shared factory.
import { makeSecureDownloadHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/student_roster_ops/service";

export const { GET } = makeSecureDownloadHandler("student_roster_ops", service, { fileColumn: "source_file", scope: "staff" });
