import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/audit_reconciliations/service";

export const { POST } = makeStaffActionHandler("audit_reconciliations", service);
