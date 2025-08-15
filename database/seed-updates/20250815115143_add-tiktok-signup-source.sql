-- migrate:up
INSERT INTO upchieve.signup_sources (name)
    VALUES ('TikTok');

-- migrate:down
DELETE FROM upchieve.signup_sources
WHERE name = 'TikTok';

