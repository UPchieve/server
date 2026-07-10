-- migrate:up
-- Moved out of migration 20250326221322_add-session-flags-for-automated-moderation
-- so that DML is not applied to logical-replication subscribers.
-- Idempotent so it is a harmless no-op on systems that already have the row.
INSERT INTO upchieve.session_flags (name)
    VALUES ('Hate speech'), ('Inappropriate conversation'), ('Platform circumvention'), ('Personally identifiable information'), ('Safety concern'), ('General moderation concern')
ON CONFLICT (name)
    DO NOTHING;

-- migrate:down
DELETE FROM upchieve.session_flags
WHERE name IN ('Hate speech', 'Inappropriate conversation', 'Platform circumvention', 'Personally identifiable information', 'Safety concern', 'General moderation concern');

