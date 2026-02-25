-- migrate:up
INSERT INTO upchieve.nths_chapter_statuses (name)
    VALUES ('PENDING'), ('OFFICIAL'), ('FAILED');

-- migrate:down
DELETE FROM upchieve.nths_chapter_statuses
WHERE name IN ('PENDING', 'OFFICIAL', 'FAILED');

