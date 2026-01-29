-- migrate:up
INSERT INTO upchieve.nths_actions (name)
    VALUES ('NAME YOUR TEAM'), ('REVIEW RESOURCES'), ('ATTEND ORIENTATION');

-- migrate:down
DELETE FROM upchieve.nths_actions
WHERE name IN ('NAME YOUR TEAM', 'REVIEW RESOURCES', 'ATTEND ORIENTATION');

