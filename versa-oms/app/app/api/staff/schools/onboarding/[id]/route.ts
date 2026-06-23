import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_onboarding_ops/service";

export const { GET, PATCH } = makeStaffItemHandlers("school_onboarding_ops", service);
