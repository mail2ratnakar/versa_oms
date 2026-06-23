import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/evaluation_ops_score_batches/service";

export const { GET, PATCH } = makeStaffItemHandlers("evaluation_ops_score_batches", service);
