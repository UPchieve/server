-- migrate:up
ALTER TABLE upchieve.moderation_settings
    ALTER COLUMN moderation_type TYPE text
    USING moderation_type::text,
    ADD CONSTRAINT moderation_settings_moderation_type_fkey FOREIGN KEY (moderation_type) REFERENCES upchieve.moderation_type (name);

DROP TYPE upchieve.moderation_types;

-- migrate:down
CREATE TYPE upchieve.moderation_types AS ENUM (
    'contextual',
    'realtime_image'
);

ALTER TABLE upchieve.moderation_settings
    DROP CONSTRAINT moderation_settings_moderation_type_fkey;

ALTER TABLE upchieve.moderation_settings
    ALTER COLUMN moderation_type TYPE upchieve.moderation_types
    USING moderation_type::upchieve.moderation_types;

