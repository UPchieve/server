-- migrate:up
INSERT INTO upchieve.moderation_type (name)
    VALUES ('contextual'), ('realtime_image');

-- migrate:down
DELETE FROM upchieve.moderation_type
WHERE name IN ('contextual', 'realtime_image');

