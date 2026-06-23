import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/support_tickets/service";

export const { POST } = makeStaffActionHandler("support_tickets", service);
