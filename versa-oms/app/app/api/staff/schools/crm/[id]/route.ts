import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_crm/service";

export const { GET, PATCH } = makeStaffItemHandlers("school_crm", service);
