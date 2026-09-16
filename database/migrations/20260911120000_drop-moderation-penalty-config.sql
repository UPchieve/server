-- migrate:up
DROP TABLE upchieve.moderation_penalty_config;

-- migrate:down
CREATE TABLE upchieve.moderation_penalty_config (
    id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    min_weight int NOT NULL,
    max_weight int NOT NULL,
    moderation_type upchieve.moderation_types UNIQUE,
    CONSTRAINT moderation_penalty_min_le_max CHECK (min_weight <= max_weight)
);

COMMENT ON TABLE upchieve.moderation_penalty_config IS 'Configuration mapping penalty weight ranges to moderation types';

COMMENT ON COLUMN upchieve.moderation_penalty_config.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.moderation_penalty_config.min_weight IS 'not_pii: Minimum penalty weight threshold for this config';

COMMENT ON COLUMN upchieve.moderation_penalty_config.max_weight IS 'not_pii: Maximum penalty weight for this config';

COMMENT ON COLUMN upchieve.moderation_penalty_config.moderation_type IS 'not_pii: Moderation system type (contextual or realtime_image)';

