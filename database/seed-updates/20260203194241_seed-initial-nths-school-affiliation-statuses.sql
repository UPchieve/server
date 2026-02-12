-- migrate:up
INSERT INTO upchieve.nths_school_affiliation_statuses (name)
    VALUES ('PENDING_SCHOOL_AFFILIATION'), ('PENDING_UPCHIEVE_VERIFICATION'), ('AFFILIATED'), ('DENIED');

-- migrate:down
DELETE FROM upchieve.nths_school_affiliation_statuses
WHERE name IN ('PENDING_SCHOOL_AFFILIATION', 'PENDING_UPCHIEVE_VERIFICATION', 'AFFILIATED', 'DENIED');

