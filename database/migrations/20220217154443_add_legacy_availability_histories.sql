-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.legacy_availability_histories (
    id uuid PRIMARY KEY,
    mongo_id varchar(26) NOT NULL,
    user_id uuid REFERENCES upchieve.users (id),
    timezone text,
    recorded_at timestamp NOT NULL,
    legacy_availability jsonb NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.legacy_availability_histories CASCADE;

