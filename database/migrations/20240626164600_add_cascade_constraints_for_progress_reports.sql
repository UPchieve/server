-- migrate:up
ALTER TABLE IF EXISTS upchieve.progress_report_concepts
    DROP CONSTRAINT progress_report_concepts_progress_report_id_fkey,
    ADD CONSTRAINT progress_report_concepts_progress_report_id_fkey FOREIGN KEY (progress_report_id) REFERENCES upchieve.progress_reports (id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS upchieve.progress_report_concept_details
    DROP CONSTRAINT progress_report_concept_details_progress_report_concept_id_fkey,
    ADD CONSTRAINT progress_report_concept_details_progress_report_concept_id_fkey FOREIGN KEY (progress_report_concept_id) REFERENCES upchieve.progress_report_concepts (id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS upchieve.progress_report_sessions
    DROP CONSTRAINT progress_report_sessions_progress_report_id_fkey,
    ADD CONSTRAINT progress_report_sessions_progress_report_id_fkey FOREIGN KEY (progress_report_id) REFERENCES upchieve.progress_reports (id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS upchieve.progress_report_summaries
    DROP CONSTRAINT progress_report_summaries_progress_report_id_fkey,
    ADD CONSTRAINT progress_report_summaries_progress_report_id_fkey FOREIGN KEY (progress_report_id) REFERENCES upchieve.progress_reports (id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS upchieve.progress_report_summary_details
    DROP CONSTRAINT progress_report_summary_details_progress_report_summary_id_fkey,
    ADD CONSTRAINT progress_report_summary_details_progress_report_summary_id_fkey FOREIGN KEY (progress_report_summary_id) REFERENCES upchieve.progress_report_summaries (id) ON DELETE CASCADE;

-- migrate:down
ALTER TABLE IF EXISTS upchieve.progress_report_concepts
    DROP CONSTRAINT progress_report_concepts_progress_report_id_fkey,
    ADD CONSTRAINT progress_report_concepts_progress_report_id_fkey FOREIGN KEY (progress_report_id) REFERENCES upchieve.progress_reports (id);

ALTER TABLE IF EXISTS upchieve.progress_report_concept_details
    DROP CONSTRAINT progress_report_concept_details_progress_report_concept_id_fkey,
    ADD CONSTRAINT progress_report_concept_details_progress_report_concept_id_fkey FOREIGN KEY (progress_report_concept_id) REFERENCES upchieve.progress_report_concepts (id);

ALTER TABLE IF EXISTS upchieve.progress_report_sessions
    DROP CONSTRAINT progress_report_sessions_progress_report_id_fkey,
    ADD CONSTRAINT progress_report_sessions_progress_report_id_fkey FOREIGN KEY (progress_report_id) REFERENCES upchieve.progress_reports (id);

ALTER TABLE IF EXISTS upchieve.progress_report_summaries
    DROP CONSTRAINT progress_report_summaries_progress_report_id_fkey,
    ADD CONSTRAINT progress_report_summaries_progress_report_id_fkey FOREIGN KEY (progress_report_id) REFERENCES upchieve.progress_reports (id);

ALTER TABLE IF EXISTS upchieve.progress_report_summary_details
    DROP CONSTRAINT progress_report_summary_details_progress_report_summary_id_fkey,
    ADD CONSTRAINT progress_report_summary_details_progress_report_summary_id_fkey FOREIGN KEY (progress_report_summary_id) REFERENCES upchieve.progress_report_summaries (id);

