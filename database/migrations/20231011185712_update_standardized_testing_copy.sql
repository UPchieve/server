-- migrate:up
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

