-- migrate:up
-- Moved out of migration 20231011185712_update_standardized_testing_copy so that
-- DML is not applied to logical-replication subscribers.
-- Idempotent since sets the same value on every run.
UPDATE
    upchieve.topics
SET
    display_name = 'SAT & ACT Prep'
WHERE
    name = 'sat';

-- migrate:down
UPDATE
    upchieve.topics
SET
    display_name = 'Standardized Testing'
WHERE
    name = 'sat';

