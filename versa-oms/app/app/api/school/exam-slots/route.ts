import { makeSchoolRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_slots/service";

export const { GET, POST } = makeSchoolRouteHandlers("school_slots", service, { allowCreate: false });
