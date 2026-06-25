// Private-storage upload (FRAMEWORK). The other half of the signed-URL engine:
// puts bytes in a PRIVATE Supabase Storage bucket and records file_metadata so
// server/files/signedUrl.ts can later mint a short-lived signed download URL.
// Fail-soft: a storage failure returns null and must NOT fail the parent write.
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const ROSTER_BUCKET = "roster-files";

// Sanitize a user-supplied filename into a safe object-path segment (no traversal, no spaces).
export function safeName(name: string | undefined): string {
  const base = (name ?? "file").split(/[\\/]/).pop() ?? "file";
  const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned.slice(0, 80) || "file";
}

// Deterministic, scoped object path. uuid keeps it unique; scope keeps a school's
// files namespaced. The path is NEVER returned to a client (signed URL only).
export function buildObjectPath(input: { ownerTable: string; schoolId?: string | null; uuid: string; filename?: string }): string {
  const scope = input.schoolId ? input.schoolId : "global";
  return `${input.ownerTable}/${scope}/${input.uuid}-${safeName(input.filename)}`;
}

type Db = ReturnType<typeof createSupabaseAdminClient>;

// Idempotent private-bucket provisioning. createBucket errors if it already exists — swallow that.
async function ensureBucket(supabase: Db, bucket: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.createBucket(bucket, { public: false });
    // "already exists" is success for our purposes; any other error -> treat as available and let upload decide.
    if (error && !/exist/i.test(error.message)) return true;
    return true;
  } catch {
    return false;
  }
}

export type StoreFileInput = {
  bytes: Buffer;
  contentType: string;
  filename?: string;
  schoolId?: string | null;
  ownerTable: string;
  ownerId: string;
  createdBy?: string | null;
  classification?: string;
  bucket?: string;
};

/**
 * Store bytes privately and record file_metadata. Returns the file_metadata id
 * (used as the record's file reference), or null on any storage failure (fail-soft).
 */
export async function storeFile(input: StoreFileInput): Promise<{ file_id: string } | null> {
  const bucket = input.bucket ?? ROSTER_BUCKET;
  try {
    const supabase = createSupabaseAdminClient();
    await ensureBucket(supabase, bucket);
    const uuid = crypto.randomUUID();
    const objectPath = buildObjectPath({ ownerTable: input.ownerTable, schoolId: input.schoolId, uuid, filename: input.filename });

    const { error: upErr } = await supabase.storage.from(bucket).upload(objectPath, input.bytes, {
      contentType: input.contentType,
      upsert: false,
    });
    if (upErr) return null;

    const { data, error } = await supabase
      .from("file_metadata")
      .insert({
        bucket,
        object_path: objectPath,
        content_type: input.contentType,
        size_bytes: input.bytes.byteLength,
        classification: input.classification ?? "restricted",
        owner_table: input.ownerTable,
        owner_id: input.ownerId,
        school_id: input.schoolId ?? null,
        created_by: input.createdBy ?? null,
      })
      .select("id")
      .single();
    if (error || !data) return null;
    return { file_id: String((data as Record<string, unknown>).id) };
  } catch {
    return null;
  }
}
