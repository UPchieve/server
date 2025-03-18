-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_metrics (
    session_id uuid PRIMARY KEY REFERENCES upchieve.sessions (id),
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
    personal_identifying_info int NOT NULL DEFAULT 0,
    graded_assignment int NOT NULL DEFAULT 0,
    coach_uncomfortable int NOT NULL DEFAULT 0,
    student_crisis int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_metrics;

