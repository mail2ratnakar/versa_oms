import { makeSchoolRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_certificates/service";

export const { GET, POST } = makeSchoolRouteHandlers("school_certificates", service, { allowCreate: false });
