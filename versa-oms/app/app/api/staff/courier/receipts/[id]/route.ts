import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/courier_ops_receipts/service";

export const { GET, PATCH } = makeStaffItemHandlers("courier_ops_receipts", service);
