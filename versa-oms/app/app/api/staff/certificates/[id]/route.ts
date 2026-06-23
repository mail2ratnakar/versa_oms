import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/certificate_ops/service";

export const { GET, PATCH } = makeStaffItemHandlers("certificate_ops", service);
