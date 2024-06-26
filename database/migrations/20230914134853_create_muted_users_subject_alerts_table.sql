-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.muted_users_subject_alerts (
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    subject_id int NOT NULL REFERENCES upchieve.subjects (id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, subject_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.muted_users_subject_alerts;

