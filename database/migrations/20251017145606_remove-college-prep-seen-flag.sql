-- migrate:up
ALTER TABLE upchieve.user_product_flags
    DROP COLUMN tell_them_college_prep_modal_seen_at;

-- migrate:down
ALTER TABLE upchieve.user_product_flags
    ADD COLUMN tell_them_college_prep_modal_seen_at timestamptz NULL;

