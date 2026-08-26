-- migrate:up
INSERT INTO upchieve.session_flags (name)
    VALUES ('Whiteboard Image Moderation Concern')
ON CONFLICT (name)
    DO NOTHING;

-- migrate:down
DELETE FROM upchieve.session_flags
WHERE name = 'Whiteboard Image Moderation Concern'
