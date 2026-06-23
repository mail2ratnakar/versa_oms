import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/results_ops_corrections/service";

export const { POST } = makeStaffActionHandler("results_ops_corrections", service);
