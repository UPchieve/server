-- migrate:up
ALTER TABLE upchieve.nths_group_actions
    DROP CONSTRAINT unique_action_per_group;

ALTER TABLE upchieve.nths_group_school_affiliation
    ADD COLUMN school_id uuid REFERENCES upchieve.schools (id);

ALTER TABLE upchieve.nths_advisors
    ADD COLUMN school_id uuid REFERENCES upchieve.schools (id);

-- migrate:down
ALTER TABLE upchieve.nths_group_actions
    ADD CONSTRAINT unique_action_per_group UNIQUE (nths_group_id, nths_action_id);

ALTER TABLE upchieve.nths_group_school_affiliation
    DROP COLUMN school_id;

ALTER TABLE upchieve.nths_advisors
    DROP COLUMN school_id;

