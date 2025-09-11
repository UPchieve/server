-- migrate:up
INSERT INTO upchieve.session_flags (name)
    VALUES ('Live media ban');

-- migrate:down
DELETE FROM upchieve.session_flags
WHERE name = 'Live media ban';

