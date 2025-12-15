-- migrate:up
CREATE TYPE upchieve.moderation_types AS ENUM (
    'contextual',
    'realtime_image'
);

CREATE TABLE upchieve.moderation_settings (
    moderation_type upchieve.moderation_types,
    moderation_category_id integer REFERENCES upchieve.moderation_categories (id),
    threshold numeric(3, 2)
);

-- migrate:down
DROP TABLE upchieve.moderation_settings;

DROP TYPE upchieve.moderation_types;

