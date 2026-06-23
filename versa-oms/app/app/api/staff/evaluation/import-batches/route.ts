import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/evaluation_ops_import_batches/service";

export const { GET, POST } = makeStaffRouteHandlers("evaluation_ops_import_batches", service);
