-- migrate:up
ALTER TABLE upchieve.user_product_flags
    ADD COLUMN IF NOT EXISTS tell_them_college_prep_modal_seen_at timestamptz NULL;

-- migrate:down
ALTER TABLE upchieve.user_product_flags
    DROP COLUMN IF EXISTS tell_them_college_prep_modal_seen_at;

