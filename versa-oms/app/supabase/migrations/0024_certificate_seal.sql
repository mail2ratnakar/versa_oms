-- FR-CERT-SEAL-2026-0011: a tamper-evident HMAC seal over a certificate's public fields, set at
-- publish. The public verify endpoint recomputes it to flag any tampering of the stored row.
alter table "public_verification" add column if not exists "content_hash" text;
