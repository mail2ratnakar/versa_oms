-- FR-MATERIAL-WINDOW-2026-0041: a download WINDOW END for exam materials.
-- release_at is the open (available AFTER); expires_at is the close (NOT available after). A NULL
-- expires_at means open-ended (no end). This lets ops respond to a school postponing or cancelling an
-- exam by extending or closing the window.
alter table exam_material_packages add column if not exists expires_at timestamptz;
comment on column exam_material_packages.expires_at is 'Download window end; NULL = no end (open-ended after release_at).';

-- Refresh PostgREST schema cache so the new column is visible immediately.
notify pgrst, 'reload schema';
