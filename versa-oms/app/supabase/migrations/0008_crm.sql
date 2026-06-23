-- CRM: a lead may be created without a pre-assigned owner, and by the system/dev
-- actor (which is not a real staff_profiles row). Owner is assigned later.
alter table "school_leads" alter column "lead_owner_id" drop not null;
alter table "school_leads" alter column "created_by" drop not null;
