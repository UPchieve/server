-- migrate:up
CREATE TABLE upchieve.teacher_session_summaries (
    id uuid NOT NULL,
    session_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (session_id) REFERENCES upchieve.sessions (id),
    PRIMARY KEY (id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.teacher_session_summaries;

