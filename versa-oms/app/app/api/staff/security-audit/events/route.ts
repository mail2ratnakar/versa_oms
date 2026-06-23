import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/audit_events_review/service";

export const { GET, POST } = makeStaffRouteHandlers("audit_events_review", service);
