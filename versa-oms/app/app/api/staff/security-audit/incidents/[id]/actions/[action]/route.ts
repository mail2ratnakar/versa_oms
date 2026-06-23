import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/security_audit_incidents/service";

export const { POST } = makeStaffActionHandler("security_audit_incidents", service);
