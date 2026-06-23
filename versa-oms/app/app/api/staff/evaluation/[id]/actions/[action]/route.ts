import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/evaluation_ops/service";

export const { POST } = makeStaffActionHandler("evaluation_ops", service);
