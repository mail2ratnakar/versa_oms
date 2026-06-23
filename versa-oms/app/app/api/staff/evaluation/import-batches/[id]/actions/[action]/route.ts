import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/evaluation_ops_import_batches/service";

export const { POST } = makeStaffActionHandler("evaluation_ops_import_batches", service);
