-- migrate:up
ALTER TABLE upchieve.notifications
    ALTER COLUMN type_id DROP NOT NULL;

ALTER TABLE upchieve.notifications
    ALTER COLUMN priority_group_id DROP NOT NULL;

ALTER TABLE upchieve.notifications
    ALTER COLUMN session_id DROP NOT NULL;

-- migrate:down
ALTER TABLE upchieve.notifications
    ALTER COLUMN type_id SET NOT NULL;

ALTER TABLE upchieve.notifications
    ALTER COLUMN priority_group_id SET NOT NULL;

ALTER TABLE upchieve.notifications
    ALTER COLUMN session_id SET NOT NULL;

