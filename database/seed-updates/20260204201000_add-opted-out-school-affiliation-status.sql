-- migrate:up
INSERT INTO upchieve.nths_school_affiliation_statuses (name)
    VALUES ('OPTED_OUT');

-- migrate:down
DELETE FROM upchieve.nths_school_affiliation_statuses
WHERE name = 'OPTED_OUT';

