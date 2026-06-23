import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/support_tickets_escalations/service";

export const { GET, PATCH } = makeStaffItemHandlers("support_tickets_escalations", service);
