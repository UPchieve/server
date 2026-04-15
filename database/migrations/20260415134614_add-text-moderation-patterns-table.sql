-- migrate:up
CREATE TABLE upchieve.text_moderation_patterns (
    id int GENERATED always AS IDENTITY PRIMARY KEY,
    regex text NOT NULL,
    rules json,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE upchieve.text_moderation_patterns;

