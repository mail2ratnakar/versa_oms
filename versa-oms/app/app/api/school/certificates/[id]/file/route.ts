import { makeSecureDownloadHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_certificates/service";

export const { GET } = makeSecureDownloadHandler("school_certificates", service, {"fileColumn": "pdf_file", "scope": "school", "gateColumn": "status", "gateValues": ["published", "downloaded"]});
