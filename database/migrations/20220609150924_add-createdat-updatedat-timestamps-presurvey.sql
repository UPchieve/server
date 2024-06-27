-- migrate:up
ALTER TABLE upchieve.question_types
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

ALTER TABLE upchieve.question_tags
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

ALTER TABLE upchieve.surveys_presession
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

ALTER TABLE upchieve.surveys_postsession
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- migrate:down
ALTER TABLE upchieve.question_types
    DROP COLUMN created_at,
    DROP COLUMN updated_at;

ALTER TABLE upchieve.question_tags
    DROP COLUMN created_at,
    DROP COLUMN updated_at;

ALTER TABLE upchieve.surveys_presession
    DROP COLUMN created_at,
    DROP COLUMN updated_at;

ALTER TABLE upchieve.surveys_postsession
    DROP COLUMN created_at,
    DROP COLUMN updated_at;

