-- migrate:up
ALTER TABLE upchieve.assistments_data
    ADD COLUMN mongo_id VARCHAR(24) UNIQUE;

-- migrate:down
ALTER TABLE upchieve.assistments_data
    DROP COLUMN mongo_id;

