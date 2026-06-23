import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/courier_ops_exceptions/service";

export const { POST } = makeStaffActionHandler("courier_ops_exceptions", service);
