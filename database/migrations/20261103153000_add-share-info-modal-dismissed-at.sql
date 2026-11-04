-- migrate:up
ALTER TABLE upchieve.user_product_flags
    ADD COLUMN share_info_modal_dismissed_at timestamptz;

COMMENT ON COLUMN upchieve.user_product_flags.share_info_modal_dismissed_at IS 'not_pii: When the volunteer first closed the share-info-with-students modal without choosing';

-- migrate:down
ALTER TABLE upchieve.user_product_flags
    DROP COLUMN share_info_modal_dismissed_at;

