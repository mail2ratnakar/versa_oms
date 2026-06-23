import { makeSchoolRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_students/service";

export const { GET, POST } = makeSchoolRouteHandlers("school_students", service, { allowCreate: true });
