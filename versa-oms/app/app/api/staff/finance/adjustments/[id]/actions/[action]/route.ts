import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/finance_ops_adjustments/service";

export const { POST } = makeStaffActionHandler("finance_ops_adjustments", service);
