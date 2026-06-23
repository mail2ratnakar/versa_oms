import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/results_publications/service";

export const { POST } = makeStaffActionHandler("results_publications", service);
