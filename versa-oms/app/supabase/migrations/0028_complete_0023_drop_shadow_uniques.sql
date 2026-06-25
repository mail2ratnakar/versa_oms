-- FR-NOTIFY-FANOUT-2026-0014: completes the 0023 sweep. For these 4 tables, 0001 created a single-column
-- UNIQUE on the natural-key column AND 0023 added the correct (key/code, version) composite + dropped the
-- single-column *_version uniques — but missed dropping these single-column *_key / *_code uniques. Each
-- makes the key globally unique, so only ONE version per key/code can ever exist (versioning broken).
-- Drop them; the (key/code, version) composite remains the natural key.
-- Approved by founder 2026-06-25 (no-spec-relaxation rule — confirmed leftovers of the 0023 bug class).
alter table "setting_definitions"      drop constraint if exists "uq_setting_definitions_setting_key";
alter table "setting_versions"         drop constraint if exists "uq_setting_versions_setting_key";
alter table "report_definitions"       drop constraint if exists "uq_report_definitions_report_code";
alter table "exam_material_templates"  drop constraint if exists "uq_exam_material_templates_template_code";
