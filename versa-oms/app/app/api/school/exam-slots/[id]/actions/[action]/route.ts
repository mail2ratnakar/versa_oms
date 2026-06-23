import { makeSchoolActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_slots/service";

export const { POST } = makeSchoolActionHandler("school_slots", service);
