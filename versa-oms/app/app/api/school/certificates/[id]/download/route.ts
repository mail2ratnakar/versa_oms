import { makeSchoolDownloadHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_certificates/service";

export const { GET } = makeSchoolDownloadHandler("school_certificates", service, {"codeColumn": "verification_code", "urlTemplate": "/api/verify/certificate/{code}", "gateColumn": "status", "gateValues": ["published", "downloaded", "verified"]});
