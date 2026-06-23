import { makeSchoolRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_roster/service";

export const { GET, POST } = makeSchoolRouteHandlers("school_roster", service, { allowCreate: true });
