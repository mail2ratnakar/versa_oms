import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_results/service";

export const { POST } = makeStaffActionHandler("core_results", service);
