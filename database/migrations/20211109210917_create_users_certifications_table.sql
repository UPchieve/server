-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.users_certifications (
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    certification_id int NOT NULL REFERENCES upchieve.certifications (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    PRIMARY KEY (user_id, certification_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.users_certifications CASCADE;

