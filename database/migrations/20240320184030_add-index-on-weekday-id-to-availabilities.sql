-- migrate:up
CREATE INDEX IF NOT EXISTS availabilities_weekday_id_idx ON upchieve.availabilities (weekday_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.availabilities_weekday_id_idx;

