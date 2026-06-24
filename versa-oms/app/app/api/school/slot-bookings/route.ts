import { makeSchoolRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_bookings/service";

export const { GET, POST } = makeSchoolRouteHandlers("school_bookings", service, { allowCreate: true });
