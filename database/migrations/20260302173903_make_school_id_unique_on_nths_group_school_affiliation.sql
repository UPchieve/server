-- migrate:up
ALTER TABLE upchieve.nths_group_school_affiliation
    ADD CONSTRAINT unique_school_id UNIQUE (school_id);

-- migrate:down
ALTER TABLE upchieve.nths_group_school_affiliation
    DROP CONSTRAINT unique_school_id;

