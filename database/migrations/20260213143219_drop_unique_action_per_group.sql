-- migrate:up
ALTER TABLE upchieve.nths_group_actions
    DROP CONSTRAINT unique_action_per_group;

-- migrate:down
ALTER TABLE upchieve.nths_group_actions
    ADD CONSTRAINT unique_action_per_group UNIQUE (nths_group_id, nths_action_id);

