import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/audit_exports_review/service";

export const { GET, PATCH } = makeStaffItemHandlers("audit_exports_review", service);
