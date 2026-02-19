-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.moderation_rule_actions (
    rule_id int NOT NULL REFERENCES upchieve.moderation_rules (id),
    action_id int NOT NULL REFERENCES upchieve.moderation_actions (id)
);

-- migrate:down
DROP TABLE moderation_rule_actions;

