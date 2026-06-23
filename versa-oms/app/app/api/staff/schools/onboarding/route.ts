import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_onboarding_ops/service";

export const { GET, POST } = makeStaffRouteHandlers("school_onboarding_ops", service);
