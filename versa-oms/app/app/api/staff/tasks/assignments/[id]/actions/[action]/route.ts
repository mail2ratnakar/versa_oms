import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/task_work_queue_assignments/service";

export const { POST } = makeStaffActionHandler("task_work_queue_assignments", service);
