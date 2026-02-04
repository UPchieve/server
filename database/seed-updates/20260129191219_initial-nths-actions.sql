-- migrate:up
INSERT INTO upchieve.nths_actions (name)
    VALUES ('NAMED YOUR TEAM'), ('REVIEWED RESOURCES'), ('ATTENDED ORIENTATION');

-- migrate:down
DELETE FROM upchieve.nths_actions
WHERE name IN ('NAMED YOUR TEAM', 'REVIEWED RESOURCES', 'ATTENDED ORIENTATION');

