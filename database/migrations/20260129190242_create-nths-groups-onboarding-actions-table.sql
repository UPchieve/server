-- migrate:up
CREATE TABLE upchieve.nths_group_actions (
    id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nths_group_id uuid REFERENCES upchieve.nths_groups (id),
    nths_action_id int REFERENCES upchieve.nths_actions (id),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX nths_group_actions_group_id ON upchieve.nths_group_actions (nths_group_id);

CREATE INDEX nths_group_actions_action_id ON upchieve.nths_group_actions (nths_action_id);

ALTER TABLE upchieve.nths_group_actions
    ADD CONSTRAINT unique_action_per_group UNIQUE (nths_group_id, nths_action_id);

-- migrate:down
DROP TABLE upchieve.nths_group_actions;

