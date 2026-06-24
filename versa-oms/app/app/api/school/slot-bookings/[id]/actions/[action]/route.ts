import { makeSchoolActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_bookings/service";

export const { POST } = makeSchoolActionHandler("school_bookings", service);
