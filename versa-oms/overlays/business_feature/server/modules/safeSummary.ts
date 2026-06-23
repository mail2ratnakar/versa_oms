import { maskRecord } from "@/server/security/fieldMasking";

export function createSafeSummary(input: {
  moduleId: string;
  entityType: string;
  entityId: string;
  status: string;
  display: Record<string, unknown>;
}) {
  return {
    module_id: input.moduleId,
    entity_type: input.entityType,
    entity_id: input.entityId,
    status: input.status,
    display: maskRecord(input.display)
  };
}
