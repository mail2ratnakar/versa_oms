import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/finance_ops/service";

export const { GET, PATCH } = makeStaffItemHandlers("finance_ops", service);
