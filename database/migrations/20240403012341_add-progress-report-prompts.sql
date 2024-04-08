-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.progress_report_prompts (
    id serial PRIMARY KEY,
    subject_id integer NOT NULL REFERENCES upchieve.subjects (id),
    prompt text NOT NULL,
    active boolean NOT NULL DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE upchieve.progress_reports
    ADD COLUMN IF NOT EXISTS prompt_id integer REFERENCES upchieve.progress_report_prompts;

CREATE INDEX IF NOT EXISTS progress_report_prompt_subject_id_active ON upchieve.progress_report_prompts (subject_id, active);

-- This index ensures that only one active true can exist per subject_id
CREATE UNIQUE INDEX IF NOT EXISTS progress_report_prompt_unique_active_subject_id ON upchieve.progress_report_prompts (subject_id)
WHERE
    active;

-- migrate:down
ALTER TABLE upchieve.progress_reports
    DROP COLUMN IF NOT EXISTS prompt_id;

DROP INDEX IF EXISTS progress_report_prompt_unique_active_subject_id;

DROP INDEX IF EXISTS progress_report_prompt_subject_id_active;

DROP TABLE IF EXISTS upchieve.progress_report_prompts;

