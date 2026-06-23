// Work-queue task creation. A work_task requires a queue_id (NOT NULL FK), so we
// ensure the queue exists first. Used by the kernel auto-task and effect chains.
type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;

export async function ensureQueue(
  supabase: Db,
  opts: { code: string; name: string; type: string; owner: string }
): Promise<string | null> {
  const { data: existing } = await supabase.from("task_queues").select("id").eq("queue_code", opts.code).maybeSingle();
  if (existing?.id) return existing.id as string;
  const { data } = await supabase
    .from("task_queues")
    .insert({ queue_code: opts.code, queue_name: opts.name, queue_type: opts.type, owner_role: opts.owner, updated_at: new Date().toISOString() })
    .select("id")
    .single();
  return (data?.id as string) ?? null;
}

export async function createWorkTask(
  supabase: Db,
  t: { title: string; type: string; queueId: string; sourceType: string; sourceId: string }
): Promise<string | null> {
  const { data } = await supabase
    .from("work_tasks")
    .insert({
      task_code: "TASK-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      task_title: t.title,
      task_type: t.type,
      queue_id: t.queueId,
      task_status: "new",
      source_entity_type: t.sourceType,
      source_entity_id: t.sourceId,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  return (data?.id as string) ?? null;
}
