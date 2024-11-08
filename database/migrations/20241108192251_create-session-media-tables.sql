-- migrate:up
CREATE TYPE upchieve.session_media_type AS ENUM (
    'video',
    'audio'
);

CREATE TABLE IF NOT EXISTS upchieve.session_media (
    id uuid PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    url text NOT NULL,
    file_type varchar(10) NOT NULL,
    TYPE upchieve.session_media_type NOT NULL,
    user_id uuid REFERENCES upchieve.users (id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS upchieve.session_media_transcripts (
    session_media_id uuid NOT NULL REFERENCES upchieve.session_media (id) PRIMARY KEY,
    transcript json
);

CREATE TYPE upchieve.session_media_moderation_job_status AS enum (
    'finished',
    'ongoing'
);

CREATE TABLE IF NOT EXISTS upchieve.session_media_moderation_jobs (
    session_media_id uuid NOT NULL REFERENCES upchieve.session_media (id) PRIMARY KEY,
    job_id varchar(30) NOT NULL,
    status upchieve.session_media_moderation_job_status NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_media_moderation_jobs;

DROP TYPE IF EXISTS upchieve.session_media_moderation_job_status;

DROP TABLE IF EXISTS upchieve.session_media_transcripts;

DROP TABLE IF EXISTS upchieve.session_media;

DROP TYPE IF EXISTS upchieve.session_media_type;

