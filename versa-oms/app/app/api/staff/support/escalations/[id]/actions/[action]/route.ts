import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/support_tickets_escalations/service";

export const { POST } = makeStaffActionHandler("support_tickets_escalations", service);
