-- migrate:up
CREATE TABLE upchieve.moderation_rules_flags (
    flag_id int NOT NULL REFERENCES upchieve.session_flags (id),
    rule_id int NOT NULL REFERENCES upchieve.moderation_rules (id)
);

-- migrate:down
DROP TABLE upchieve.moderation_rules_flags;

