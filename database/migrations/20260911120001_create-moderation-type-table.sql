-- migrate:up
CREATE TABLE upchieve.moderation_type (
    id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL UNIQUE
);

COMMENT ON TABLE upchieve.moderation_type IS 'Supported moderation system types';

COMMENT ON COLUMN upchieve.moderation_type.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.moderation_type.name IS 'not_pii: Moderation system type name';

-- migrate:down
DROP TABLE upchieve.moderation_type;

