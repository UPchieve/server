-- migrate:up
INSERT INTO upchieve.session_flags (name)
    VALUES ('Hate speech'), ('Inappropriate conversation'), ('Platform circumvention'), ('Personally identifiable information'), ('Safety concern'), ('General moderation concern');

-- migrate:down
DELETE FROM upchieve.session_flags
WHERE name IN ('Hate speech', 'Inappropriate conversation', 'Platform circumvention', 'Personally identifiable information', 'Safety concern', 'General moderation concern');

