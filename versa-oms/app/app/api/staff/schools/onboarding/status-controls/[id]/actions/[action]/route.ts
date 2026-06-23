import { makeStaffActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_onboarding_status_controls/service";

export const { POST } = makeStaffActionHandler("school_onboarding_status_controls", service);
