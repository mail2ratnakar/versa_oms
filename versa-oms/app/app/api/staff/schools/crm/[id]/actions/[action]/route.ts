import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_crm/service";

export const { POST } = makeStaffActionHandler("school_crm", service);
