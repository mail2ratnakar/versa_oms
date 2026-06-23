import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/security_audit_forensics/service";

export const { POST } = makeStaffActionHandler("security_audit_forensics", service);
