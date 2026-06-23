import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/courier_ops_exceptions/service";

export const { GET, PATCH } = makeStaffItemHandlers("courier_ops_exceptions", service);
