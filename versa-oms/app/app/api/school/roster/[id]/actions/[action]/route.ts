import { makeSchoolActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_roster/service";

export const { POST } = makeSchoolActionHandler("school_roster", service);
