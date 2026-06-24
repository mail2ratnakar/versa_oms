-- Action timestamps (booked_at, opened_at, downloaded_at, ...) are conditional — set when the action occurs, not by the generic kernel create. Domain range dates (window/registration) excluded.
alter table "audit_cases" alter column "opened_at" drop not null;
alter table "security_incidents" alter column "opened_at" drop not null;
alter table "reconciliation_runs" alter column "run_started_at" drop not null;
alter table "dashboard_alert_dismissals" alter column "dismissed_at" drop not null;
alter table "dashboard_snapshots" alter column "expires_at" drop not null;
alter table "courier_events" alter column "event_at" drop not null;
alter table "exam_materials" alter column "release_at" drop not null;
alter table "exam_material_downloads" alter column "downloaded_at" drop not null;
alter table "exam_slot_bookings" alter column "booked_at" drop not null;
alter table "finance_payment_links" alter column "expires_at" drop not null;
alter table "notification_delivery_attempts" alter column "attempted_at" drop not null;
alter table "school_lead_interactions" alter column "interaction_at" drop not null;
alter table "school_status_controls" alter column "applied_at" drop not null;
alter table "staff_invitations" alter column "expires_at" drop not null;
alter table "student_uploads" alter column "uploaded_at" drop not null;
