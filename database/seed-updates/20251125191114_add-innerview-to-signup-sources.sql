-- migrate:up
INSERT INTO upchieve.signup_sources (name)
    VALUES ('Innerview');

-- migrate:down
DELETE FROM upchieve.signup_sources
WHERE name = 'Innerview';

