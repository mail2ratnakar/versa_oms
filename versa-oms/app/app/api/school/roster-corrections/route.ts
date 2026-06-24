import { makeSchoolRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_roster_corrections/service";

export const { GET, POST } = makeSchoolRouteHandlers("school_roster_corrections", service, { allowCreate: true });
