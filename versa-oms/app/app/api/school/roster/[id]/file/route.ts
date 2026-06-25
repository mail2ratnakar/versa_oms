import { makeSecureDownloadHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_roster/service";

export const { GET } = makeSecureDownloadHandler("school_roster", service, {"fileColumn": "source_file", "scope": "school"});
