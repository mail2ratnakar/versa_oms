-- Versa OMS DB-level immutability: append-only audit + no-hard-delete on business records.

-- 1) audit_events is strictly append-only: block UPDATE and DELETE.
create or replace function "versa_block_mutation"() returns trigger as $$
begin
  raise exception 'append_only_violation: % on % is forbidden', tg_op, tg_table_name;
end;
$$ language plpgsql;

drop trigger if exists "trg_audit_events_append_only" on "audit_events";
create trigger "trg_audit_events_append_only"
  before update or delete on "audit_events"
  for each row execute function "versa_block_mutation"();

-- 2) No hard delete on business/security records: block DELETE (use archived_at/revoke/supersede).
create or replace function "versa_block_delete"() returns trigger as $$
begin
  raise exception 'no_hard_delete: delete on % is forbidden; archive/revoke/supersede instead', tg_table_name;
end;
$$ language plpgsql;

do $$
declare
  t text;
  protected text[] := array[
    'schools','school_users','students','participations','payments','results','candidate_results',
    'certificates','exam_slots','exam_materials','exam_material_packages','courier_batches','omr_imports',
    'staff_profiles','portal_roles','finance_invoices','finance_payments','result_batches',
    'certificate_templates','public_verification','approvals','job_runs'
  ];
begin
  foreach t in array protected loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('drop trigger if exists %I on %I', 'trg_' || t || '_no_delete', t);
      execute format('create trigger %I before delete on %I for each row execute function versa_block_delete()',
                     'trg_' || t || '_no_delete', t);
    end if;
  end loop;
end;
$$;
