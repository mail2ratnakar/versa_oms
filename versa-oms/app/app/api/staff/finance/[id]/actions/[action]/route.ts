import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/finance_ops/service";

export const { POST } = makeStaffActionHandler("finance_ops", service);
