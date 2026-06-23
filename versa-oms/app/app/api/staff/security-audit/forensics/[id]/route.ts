import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/security_audit_forensics/service";

export const { GET, PATCH } = makeStaffItemHandlers("security_audit_forensics", service);
