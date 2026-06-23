import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/certificate_ops/service";

export const { POST } = makeStaffActionHandler("certificate_ops", service);
