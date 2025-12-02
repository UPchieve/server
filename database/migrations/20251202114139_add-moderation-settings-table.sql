-- migrate:up
CREATE TYPE upchieve.moderation_types as ENUM ('contextual', 'realtime_image');

CREATE TABLE upchieve.moderation_settings(
  moderation_type upchieve.moderation_types,
  moderation_category_id integer REFERENCES upchieve.moderation_categories(id),
  threshold numeric(3, 2),
  penalty integer 
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.moderation_settings;

DROP TYPE IF EXISTS upchieve.moderation_types;
