import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/audit_events_review/service";

export const { POST } = makeStaffActionHandler("audit_events_review", service);
