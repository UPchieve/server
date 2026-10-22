-- migrate:up
ALTER TABLE upchieve.sessions
    ADD COLUMN requested_volunteer_id uuid REFERENCES upchieve.users (id),
    ADD COLUMN opened_to_all_at timestamptz;

COMMENT ON COLUMN upchieve.sessions.requested_volunteer_id IS 'not_pii: Originally requested tutor, retained after opening to all tutors and matching';

COMMENT ON COLUMN upchieve.sessions.opened_to_all_at IS 'not_pii: When the student opened the request to all tutors';

-- migrate:down
ALTER TABLE upchieve.sessions
    DROP COLUMN opened_to_all_at,
    DROP COLUMN requested_volunteer_id;

