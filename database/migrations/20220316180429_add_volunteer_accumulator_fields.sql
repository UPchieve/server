-- migrate:up
ALTER TABLE upchieve.volunteer_profiles
    ADD COLUMN total_volunteer_hours float,
    ADD COLUMN elapsed_availability bigint;

CREATE TABLE IF NOT EXISTS upchieve.volunteer_occupations (
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    occupation text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

ALTER TABLE upchieve.volunteer_occupations
    ADD CONSTRAINT unique_user_id_occupation UNIQUE (user_id, occupation);

-- migrate:down
ALTER TABLE upchieve.volunteer_profiles
    DROP COLUMN total_volunteer_hours,
    DROP COLUMN elapsed_availability;

DROP TABLE IF EXISTS upchieve.volunteer_occupations CASCADE;

