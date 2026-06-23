import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/support_tickets_escalations/service";

export const { GET, POST } = makeStaffRouteHandlers("support_tickets_escalations", service);
