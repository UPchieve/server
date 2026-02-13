-- migrate:up
ALTER TYPE upchieve.moderation_types
    ADD VALUE 'realtime_text';

-- migrate:down
ALTER TYPE upchieve.moderation_types RENAME TO moderation_types_markedfordelete;

CREATE TYPE upchieve.moderation_types AS ENUM (
    'contextual',
    'realtime_image'
);

ALTER TABLE upchieve.moderation_settings
    ALTER COLUMN moderation_type TYPE upchieve.moderation_types
    USING moderation_type::text::upchieve.moderation_types;

ALTER TABLE upchieve.moderation_penalty_config
    ALTER COLUMN moderation_type TYPE upchieve.moderation_types
    USING moderation_type::text::upchieve.moderation_types;

DROP TYPE upchieve.moderation_types_markedfordelete;

