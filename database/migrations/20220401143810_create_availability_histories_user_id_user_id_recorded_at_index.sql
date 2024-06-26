-- migrate:up
CREATE INDEX IF NOT EXISTS availability_histories_user_id_recorded_at ON upchieve.availability_histories (user_id, recorded_at);

-- migrate:down
DROP INDEX IF EXISTS upchieve.availability_histories_user_id_recorded_at;

