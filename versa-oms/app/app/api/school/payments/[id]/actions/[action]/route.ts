import { makeSchoolActionHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/school_payments/service";

export const { POST } = makeSchoolActionHandler("school_payments", service);
