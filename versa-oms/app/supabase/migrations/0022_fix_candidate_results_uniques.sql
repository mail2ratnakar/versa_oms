-- FR-RESULTS-RANKING-2026-0006: candidate_results shipped with single-column UNIQUE constraints on
-- result_batch_id, candidate_id and result_version (generated-DDL bug). Each made a real results
-- batch impossible: unique(result_batch_id) => one candidate per batch; unique(result_version) =>
-- only one candidate_result could ever hold 'v1'; unique(candidate_id) => a candidate could not have
-- results in more than one subject/batch. Replace them with the correct natural key.
alter table "candidate_results" drop constraint if exists "uq_candidate_results_result_batch_id";
alter table "candidate_results" drop constraint if exists "uq_candidate_results_candidate_id";
alter table "candidate_results" drop constraint if exists "uq_candidate_results_result_version";
alter table "candidate_results" add constraint "uq_candidate_results_batch_candidate_subject"
  unique ("result_batch_id", "candidate_id", "subject_code");
