-- migrate:up
CREATE TABLE upchieve.nths_group_checklist_item_progress (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nths_group_id uuid NOT NULL REFERENCES upchieve.nths_groups (id),
    item_key text NOT NULL,
    status text NOT NULL,
    updated_by_user_id uuid NOT NULL REFERENCES upchieve.users (id),
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
    UNIQUE (nths_group_id, item_key)
);

COMMENT ON COLUMN upchieve.nths_group_checklist_item_progress.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.nths_group_checklist_item_progress.nths_group_id IS 'not_pii: Foreign key to upchieve.nths_groups';

COMMENT ON COLUMN upchieve.nths_group_checklist_item_progress.item_key IS 'not_pii: Stable key for the checklist item';

COMMENT ON COLUMN upchieve.nths_group_checklist_item_progress.status IS 'not_pii: Current checklist item status';

COMMENT ON COLUMN upchieve.nths_group_checklist_item_progress.updated_by_user_id IS 'pii: User who most recently updated the checklist item';

COMMENT ON COLUMN upchieve.nths_group_checklist_item_progress.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.nths_group_checklist_item_progress.updated_at IS 'not_pii';

-- migrate:down
DROP TABLE upchieve.nths_group_checklist_item_progress;

