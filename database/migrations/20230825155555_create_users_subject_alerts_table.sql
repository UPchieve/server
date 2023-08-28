-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.users_subject_alerts (
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    subject_id int NOT NULL REFERENCES upchieve.subjects (id),
    alerts_on boolean NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, subject_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.users_subject_alerts;

