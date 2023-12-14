-- migrate:up
INSERT INTO upchieve.progress_report_statuses (name)
    VALUES ('pending'), ('processing'), ('error'), ('complete')
ON CONFLICT ON CONSTRAINT progress_report_statuses_name_key
    DO NOTHING;

INSERT INTO upchieve.progress_report_analysis_types (name)
    VALUES ('single'), ('group')
ON CONFLICT ON CONSTRAINT progress_report_analysis_types_name_key
    DO NOTHING;

INSERT INTO upchieve.progress_report_evaluation_types (name, display_name)
    VALUES ('strength', 'Strength'), ('practiceArea', 'Practice Area')
ON CONFLICT ON CONSTRAINT progress_report_evaluation_types_name_key
    DO NOTHING;

INSERT INTO upchieve.progress_report_evaluation_detail_types (name)
    VALUES ('recommendation'), ('reason')
ON CONFLICT ON CONSTRAINT progress_report_evaluation_detail_types_name_key
    DO NOTHING;

-- migrate:down
DELETE FROM upchieve.progress_report_evaluation_detail_types;

DELETE FROM upchieve.progress_report_evaluation_types;

DELETE FROM upchieve.progress_report_analysis_types;

DELETE FROM upchieve.progress_report_statuses;

