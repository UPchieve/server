-- migrate:up
INSERT INTO upchieve.nths_school_affiliation_statuses (name)
    VALUES ('UNAFFILIATED');

-- migrate:down
DELETE FROM upchieve.nths_school_affiliation_statuses
WHERE name = 'UNAFFILIATED';

