-- migrate:up
ALTER TABLE upchieve.nths_groups
    ADD COLUMN receiving_coordinator_support boolean NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN upchieve.nths_groups.receiving_coordinator_support IS 'not_pii: Whether the NTHS chapter is receiving support from a partnership coordinator';

-- migrate:down
ALTER TABLE upchieve.nths_groups
    DROP COLUMN receiving_coordinator_support;

