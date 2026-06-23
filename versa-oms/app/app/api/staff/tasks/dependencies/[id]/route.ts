import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/task_work_queue_dependencies/service";

export const { GET, PATCH } = makeStaffItemHandlers("task_work_queue_dependencies", service);
