-- System/seed-created invoices may have no staff creator (dev/system actor).
alter table "finance_invoices" alter column "created_by" drop not null;
