import { makeSchoolRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_payments/service";

export const { GET, POST } = makeSchoolRouteHandlers("school_payments", service, { allowCreate: false });
