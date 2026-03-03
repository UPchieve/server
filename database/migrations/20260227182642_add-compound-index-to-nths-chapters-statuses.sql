-- migrate:up
CREATE INDEX nths_chapters_statuses_group_createdat_idx ON upchieve.nths_chapters_statuses (nths_group_id, created_at DESC);

-- migrate:down
DROP INDEX upchieve.nths_chapters_statuses_group_createdat_idx;

