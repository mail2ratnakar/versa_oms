import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Real short-lived signed download URL from private storage. Looks up the file's
 * bucket/object_path in file_metadata and asks Supabase Storage for a signed URL.
 * NEVER returns the raw object path; returns null when unavailable (no leak).
 */
const DEFAULT_TTL = Number.parseInt(process.env.SIGNED_URL_TTL_SECONDS ?? "900", 10) || 900;

export async function createSignedDownloadUrl(input: {
  fileId: string;
  actorId: string;
  ttlSeconds?: number;
}): Promise<{ file_id: string; download_url: string | null; expires_at: string; ttl_seconds: number; disposition: "attachment" }> {
  const ttl = input.ttlSeconds ?? DEFAULT_TTL;
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
  let downloadUrl: string | null = null;
  try {
    const supabase = createSupabaseAdminClient();
    const { data: meta } = await supabase
      .from("file_metadata")
      .select("bucket, object_path, archived_at")
      .eq("id", input.fileId)
      .maybeSingle();
    if (meta && !meta.archived_at) {
      const { data } = await supabase.storage.from(meta.bucket as string).createSignedUrl(meta.object_path as string, ttl, {
        download: true,
      });
      downloadUrl = data?.signedUrl ?? null;
    }
  } catch {
    downloadUrl = null; // no storage available — do not leak a path
  }
  return { file_id: input.fileId, download_url: downloadUrl, expires_at: expiresAt, ttl_seconds: ttl, disposition: "attachment" };
}
