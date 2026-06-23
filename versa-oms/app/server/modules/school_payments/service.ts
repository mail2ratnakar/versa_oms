import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
  })
  .passthrough();

export const { listModuleRecords, createModuleRecord, transitionModuleRecord, getTransition } = defineModuleService({
  moduleId: "school_payments",
  table: "payments",
  scope: "school",
  statusColumn: "status",
  policy: {},
  transitions: {"create_link": {"target": "payment_link_created", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
