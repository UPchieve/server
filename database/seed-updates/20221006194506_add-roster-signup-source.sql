-- migrate:up
INSERT INTO upchieve.signup_sources (name, created_at, updated_at)
    VALUES ('Roster', NOW(), NOW());

-- migrate:down
DELETE FROM upchieve.signup_sources
WHERE name = 'Roster'
