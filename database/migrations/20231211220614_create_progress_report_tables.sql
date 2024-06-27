-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.progress_report_statuses (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.progress_reports (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    status_id integer NOT NULL REFERENCES upchieve.progress_report_statuses,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.progress_report_analysis_types (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.progress_report_sessions (
    progress_report_id uuid NOT NULL REFERENCES upchieve.progress_reports (id),
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    progress_report_analysis_type_id integer NOT NULL REFERENCES upchieve.progress_report_analysis_types (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (progress_report_id, session_id, progress_report_analysis_type_id)
);

CREATE TABLE IF NOT EXISTS upchieve.progress_report_focus_areas (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    display_name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.progress_report_info_types (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.progress_report_summaries (
    id uuid PRIMARY KEY,
    summary text NOT NULL,
    overall_grade smallint NOT NULL,
    progress_report_id uuid NOT NULL REFERENCES upchieve.progress_reports (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.progress_report_concepts (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    grade smallint NOT NULL,
    progress_report_id uuid NOT NULL REFERENCES upchieve.progress_reports (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.progress_report_concept_details (
    id uuid PRIMARY KEY,
    content text NOT NULL,
    progress_report_concept_id uuid NOT NULL REFERENCES upchieve.progress_report_concepts (id),
    progress_report_focus_area_id integer NOT NULL REFERENCES upchieve.progress_report_focus_areas (id),
    progress_report_info_type_id integer NOT NULL REFERENCES upchieve.progress_report_info_types (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.progress_report_summary_details (
    id uuid PRIMARY KEY,
    content text NOT NULL,
    progress_report_summary_id uuid NOT NULL REFERENCES upchieve.progress_report_summaries (id),
    progress_report_focus_area_id integer NOT NULL REFERENCES upchieve.progress_report_focus_areas (id),
    progress_report_info_type_id integer NOT NULL REFERENCES upchieve.progress_report_info_types (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX progress_reports_user_id ON upchieve.progress_reports (user_id);

CREATE INDEX progress_report_sessions_progress_report_id ON upchieve.progress_report_sessions (progress_report_id);

CREATE INDEX progress_report_sessions_session_id ON upchieve.progress_report_sessions (session_id);

CREATE INDEX progress_report_sessions_analysis_type_created_at ON upchieve.progress_report_sessions (progress_report_analysis_type_id, created_at);

CREATE INDEX progress_report_summaries_progress_report_id ON upchieve.progress_report_summaries (progress_report_id);

CREATE INDEX progress_report_concepts_progress_report_id ON upchieve.progress_report_concepts (progress_report_id);

CREATE INDEX progress_report_summary_details_report_summary_id ON upchieve.progress_report_summary_details (progress_report_summary_id);

CREATE INDEX progress_report_concept_details_concept_id ON upchieve.progress_report_concept_details (progress_report_concept_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.progress_reports_user_id;

DROP INDEX IF EXISTS upchieve.progress_report_sessions_progress_report_id;

DROP INDEX IF EXISTS upchieve.progress_report_sessions_session_id;

DROP INDEX IF EXISTS upchieve.progress_report_sessions_analysis_type_created_at;

DROP INDEX IF EXISTS upchieve.progress_report_summaries_progress_report_id;

DROP INDEX IF EXISTS upchieve.progress_report_concepts_progress_report_id;

DROP INDEX IF EXISTS upchieve.progress_report_summary_details_report_summary_id;

DROP INDEX IF EXISTS upchieve.progress_report_concept_details_concept_id;

DROP TABLE IF EXISTS upchieve.progress_report_summary_details;

DROP TABLE IF EXISTS upchieve.progress_report_concept_details;

DROP TABLE IF EXISTS upchieve.progress_report_concepts;

DROP TABLE IF EXISTS upchieve.progress_report_summaries;

DROP TABLE IF EXISTS upchieve.progress_report_info_types;

DROP TABLE IF EXISTS upchieve.progress_report_focus_areas;

DROP TABLE IF EXISTS upchieve.progress_report_sessions;

DROP TABLE IF EXISTS upchieve.progress_report_analysis_types;

DROP TABLE IF EXISTS upchieve.progress_reports;

DROP TABLE IF EXISTS upchieve.progress_report_statuses;

