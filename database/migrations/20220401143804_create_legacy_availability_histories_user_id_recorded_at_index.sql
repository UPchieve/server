-- migrate:up
CREATE INDEX IF NOT EXISTS legacy_availability_histories_user_id_recorded_at ON upchieve.legacy_availability_histories (user_id, recorded_at);

-- migrate:down
DROP INDEX IF EXISTS upchieve.legacy_availability_histories_user_id_recorded_at;

