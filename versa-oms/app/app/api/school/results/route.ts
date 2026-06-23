import { makeSchoolRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_results/service";

export const { GET, POST } = makeSchoolRouteHandlers("school_results", service, { allowCreate: false });
