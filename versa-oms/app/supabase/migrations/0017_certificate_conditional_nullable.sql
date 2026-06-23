-- Certificate revocation_reason is conditional (revoked only); result_id is null for
-- participation certificates that aren't tied to a ranked result.
alter table "certificates" alter column "revocation_reason" drop not null;
alter table "certificates" alter column "result_id" drop not null;
