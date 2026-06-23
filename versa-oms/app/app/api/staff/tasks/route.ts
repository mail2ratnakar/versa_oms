import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/task_work_queue/service";

export const { GET, POST } = makeStaffRouteHandlers("task_work_queue", service);
