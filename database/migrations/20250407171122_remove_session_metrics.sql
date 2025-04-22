-- migrate:up
DROP TABLE upchieve.session_metrics;

-- migrate:down
CREATE TABLE upchieve.session_metrics (
    session_id uuid PRIMARY KEY REFERENCES upchieve.sessions (id),
    absent_student boolean NOT NULL DEFAULT FALSE,
    absent_volunteer boolean NOT NULL DEFAULT FALSE,
    low_session_rating_from_coach boolean NOT NULL DEFAULT FALSE,
    low_session_rating_from_student boolean NOT NULL DEFAULT FALSE,
    low_coach_rating_from_student boolean NOT NULL DEFAULT FALSE,
    reported boolean NOT NULL DEFAULT FALSE,
    only_looking_for_answers boolean NOT NULL DEFAULT FALSE,
    rude_or_inappropriate boolean NOT NULL DEFAULT FALSE,
    comment_from_student boolean NOT NULL DEFAULT FALSE,
    comment_from_volunteer boolean NOT NULL DEFAULT FALSE,
    has_been_unmatched boolean NOT NULL DEFAULT FALSE,
    has_had_technical_issues boolean NOT NULL DEFAULT FALSE,
    personal_identifying_info boolean NOT NULL DEFAULT FALSE,
    graded_assignment boolean NOT NULL DEFAULT FALSE,
    coach_uncomfortable boolean NOT NULL DEFAULT FALSE,
    student_crisis boolean NOT NULL DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

