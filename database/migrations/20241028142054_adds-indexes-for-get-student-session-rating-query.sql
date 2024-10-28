-- migrate:up
CREATE INDEX IF NOT EXISTS users_surveys_idx_session_id ON upchieve.users_surveys (session_id);

CREATE INDEX IF NOT EXISTS users_submissions_idx_user_id ON upchieve.users_surveys_submissions (user_survey_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.users_surveys_idx_session_id;

DROP INDEX IF EXISTS upchieve.users_submissions_idx_user_id;

