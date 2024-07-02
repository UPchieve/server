-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.availabilities (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    weekday_id int NOT NULL REFERENCES upchieve.weekdays (id),
    available_start smallint,
    available_end smallint,
    timezone text,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.availabilities CASCADE;

