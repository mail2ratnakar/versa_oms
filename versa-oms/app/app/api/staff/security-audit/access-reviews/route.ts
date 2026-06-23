import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/security_audit_access_reviews/service";

export const { GET, POST } = makeStaffRouteHandlers("security_audit_access_reviews", service);
