-- migrate:up
ALTER TABLE upchieve.moderation_infractions
    ALTER COLUMN session_id DROP NOT NULL;

-- migrate:down
ALTER TABLE upchieve.moderation_infractions
    ALTER COLUMN session_id SET NOT NULL;

