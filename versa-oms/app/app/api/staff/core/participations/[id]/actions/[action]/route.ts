import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_participations/service";

export const { POST } = makeStaffActionHandler("core_participations", service);
