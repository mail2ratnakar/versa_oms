import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
  })
  .passthrough();

export const { listModuleRecords, createModuleRecord, getModuleRecord } = defineModuleService({
  moduleId: "school_certificates",
  table: "certificates",
  scope: "school",
  statusColumn: "status",
  policy: {},
  createSchema,
});
