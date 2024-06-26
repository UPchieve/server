-- migrate:up
CREATE TYPE paid_tutors_pilot_groups AS ENUM (
    'control',
    'test'
);

ALTER TABLE upchieve.user_product_flags
    ADD COLUMN IF NOT EXISTS paid_tutors_pilot_group paid_tutors_pilot_groups;

-- migrate:down
ALTER TABLE upchieve.user_product_flags
    DROP COLUMN IF EXISTS paid_tutors_pilot_group;

DROP TYPE paid_tutors_pilot_groups
