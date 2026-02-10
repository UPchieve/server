-- migrate:up
INSERT INTO upchieve.nths_actions (name)
    VALUES ('OPTED OUT');

-- migrate:down
DELETE FROM upchieve.nths_actions
WHERE name = 'OPTED OUT';

