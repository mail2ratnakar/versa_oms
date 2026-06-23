import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/audit_cases/service";

export const { POST } = makeStaffActionHandler("audit_cases", service);
