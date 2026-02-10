-- migrate:up
CREATE TABLE upchieve.nths_group_school_affiliation (
    nths_group_id uuid NOT NULL UNIQUE REFERENCES upchieve.nths_groups (id),
    nths_school_affiliation_status_id int NOT NULL REFERENCES upchieve.nths_school_affiliation_statuses (id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE upchieve.nths_group_school_affiliation;

