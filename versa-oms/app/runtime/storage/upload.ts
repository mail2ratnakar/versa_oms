// FROZEN-KERNEL — file storage for campaign attachments/media. Provider via STORAGE_PROVIDER (default "local"
// for the dev harness; "supabase" for production hosting). Plug-and-play like the email gateway / pincode proxy:
// add a provider branch, nothing else changes. Returns a hosted URL the preview + emails can reference.
type Upload = { name: string; contentType: string; dataB64: string };
type Stored = { url: string; name: string };

// dev/local: keep bytes in memory (matches the in-memory db) and serve them from the dev server at /uploads/:id
const _local = new Map<string, { buf: Buffer; contentType: string; name: string }>();
export function getLocalUpload(id: string) { return _local.get(id); }

function localStore(u: Upload, id: string): Stored {
  _local.set(id, { buf: Buffer.from(u.dataB64, "base64"), contentType: u.contentType, name: u.name });
  return { url: "/uploads/" + id, name: u.name };  // client makes this absolute; dev-only reachability
}

async function supabaseStore(u: Upload, id: string): Promise<Stored> {
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY, bucket = process.env.SUPABASE_BUCKET || "campaign-media";
  if (!base || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY not set");
  const path = id + "-" + u.name.replace(/[^A-Za-z0-9._-]/g, "_");
  const r = await fetch(base + "/storage/v1/object/" + bucket + "/" + path, {
    method: "POST",
    headers: { authorization: "Bearer " + key, "content-type": u.contentType || "application/octet-stream", "x-upsert": "true" },
    body: Buffer.from(u.dataB64, "base64"),
  });
  if (!r.ok) throw new Error("supabase upload failed: " + r.status + " " + (await r.text()).slice(0, 120));
  return { url: base + "/storage/v1/object/public/" + bucket + "/" + path, name: u.name };  // public, email-reachable
}

export async function uploadFile(u: Upload): Promise<Stored> {
  if (!u || !u.dataB64 || !u.name) throw new Error("a file is required");
  const id = crypto.randomUUID().slice(0, 12);
  const provider = (process.env.STORAGE_PROVIDER || "local").toLowerCase();
  return provider === "supabase" ? await supabaseStore(u, id) : localStore(u, id);
}
