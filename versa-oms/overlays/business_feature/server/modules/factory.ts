import { db } from "@/server/core/db";
import { maskRecords } from "@/server/security/fieldMasking";
import type { ResolvedActor } from "@/server/auth/resolveActor";

export function createModuleService(moduleId: string) {
  return {
    async list(input: { actor: ResolvedActor; schoolId?: string | null }) {
      const rows = await db.query<Record<string, unknown>>(
        "select id, module_id, entity_type, school_id, status, data, created_at, updated_at from business_entities where module_id = $1 order by created_at desc limit 50",
        [moduleId]
      );

      const scoped = input.schoolId ? rows.filter((row) => row.school_id === input.schoolId) : rows;
      return {
        items: maskRecords(scoped),
        pagination: {
          page: 1,
          page_size: 50,
          total_count: scoped.length,
          has_next: false,
          next_cursor: null
        }
      };
    },

    async create(input: {
      actor: ResolvedActor;
      entityType: string;
      status: string;
      schoolId?: string | null;
      data: Record<string, unknown>;
    }) {
      const id = crypto.randomUUID();
      await db.execute(
        "insert into business_entities (id, module_id, entity_type, school_id, status, data, created_by) values ($1,$2,$3,$4,$5,$6,$7)",
        [id, moduleId, input.entityType, input.schoolId ?? null, input.status, JSON.stringify(input.data), input.actor.actor_id]
      );
      return { id, module_id: moduleId, entity_type: input.entityType, status: input.status };
    }
  };
}
