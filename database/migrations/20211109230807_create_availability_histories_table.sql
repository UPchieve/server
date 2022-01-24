-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.availability_histories (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    weekday_id int NOT NULL REFERENCES upchieve.weekdays (id),
    available_start smallint,
    available_end smallint,
    timezone text,
    recorded_at timestamp,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.availability_histories CASCADE;

