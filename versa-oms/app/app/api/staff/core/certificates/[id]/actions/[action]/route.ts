import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_certificates/service";

export const { POST } = makeStaffActionHandler("core_certificates", service);
