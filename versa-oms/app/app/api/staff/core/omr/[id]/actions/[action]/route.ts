import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_omr/service";

export const { POST } = makeStaffActionHandler("core_omr", service);
