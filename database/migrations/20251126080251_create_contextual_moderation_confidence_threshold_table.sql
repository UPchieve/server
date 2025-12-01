-- migrate:up
CREATE TABLE upchieve.contextual_moderation_confidence_thresholds (
    id serial PRIMARY KEY,
    flag_reason character varying(255) NOT NULL UNIQUE,
    confidence_rating int NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.contextual_moderation_confidence_thresholds CASCADE;
