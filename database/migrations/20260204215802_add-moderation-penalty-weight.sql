-- migrate:up
CREATE TABLE upchieve.moderation_penalty_config (
    id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    min_weight int NOT NULL,
    max_weight int NOT NULL,
    moderation_type upchieve.moderation_types UNIQUE,
    CONSTRAINT moderation_penalty_min_le_max CHECK (min_weight <= max_weight)
);

ALTER TABLE upchieve.moderation_settings
    ADD COLUMN penalty_weight int NOT NULL DEFAULT 0;

-- migrate:down
DROP TABLE upchieve.moderation_penalty_config;

ALTER TABLE upchieve.moderation_settings
    DROP COLUMN penalty_weight;

