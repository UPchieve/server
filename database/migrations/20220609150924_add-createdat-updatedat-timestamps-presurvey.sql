-- migrate:up
ALTER TABLE upchieve.question_types
  ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL;
ALTER TABLE upchieve.question_tags
  ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL;
ALTER TABLE upchieve.surveys_presession
  ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL;
ALTER TABLE upchieve.surveys_postsession
  ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL;

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

