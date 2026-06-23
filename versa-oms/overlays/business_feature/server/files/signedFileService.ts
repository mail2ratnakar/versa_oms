export async function createSignedDownloadResponse(input: {
  fileId: string;
  actorId: string;
  moduleId: string;
  ttlSeconds?: number;
}) {
  const ttl = input.ttlSeconds ?? 900;
  return {
    file_id: input.fileId,
    download_url: `/api/internal/signed-download/${input.fileId}`,
    expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
    ttl_seconds: ttl,
    disposition: "attachment",
    content_type: "application/octet-stream"
  };
}
