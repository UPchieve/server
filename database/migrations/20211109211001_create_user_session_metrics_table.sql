-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.user_session_metrics (
    user_id uuid PRIMARY KEY REFERENCES upchieve.users (id),
    absent_student int NOT NULL DEFAULT 0,
    absent_volunteer int NOT NULL DEFAULT 0,
    low_session_rating_from_coach int NOT NULL DEFAULT 0,
    low_session_rating_from_student int NOT NULL DEFAULT 0,
    low_coach_rating_from_student int NOT NULL DEFAULT 0,
    reported int NOT NULL DEFAULT 0,
    only_looking_for_answers int NOT NULL DEFAULT 0,
    rude_or_inappropriate int NOT NULL DEFAULT 0,
    comment_from_student int NOT NULL DEFAULT 0,
    comment_from_volunteer int NOT NULL DEFAULT 0,
    has_been_unmatched int NOT NULL DEFAULT 0,
    has_had_technical_issues int NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.user_session_metrics CASCADE;

