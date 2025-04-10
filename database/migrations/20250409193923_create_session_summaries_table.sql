-- migrate:up
CREATE TABLE upchieve.session_summaries (
    id uuid NOT NULL,
    session_id uuid NOT NULL,
    summary text NOT NULL,
    user_type int,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (session_id) REFERENCES upchieve.sessions (id),
    FOREIGN KEY (user_type) REFERENCES upchieve.user_roles (id),
    PRIMARY KEY (id)
);

-- migrate:down
DROP TABLE upchieve.session_summaries;

