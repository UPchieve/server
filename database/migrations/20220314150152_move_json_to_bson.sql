-- migrate:up
ALTER TABLE upchieve.volunteer_profiles
    ALTER COLUMN experience TYPE jsonb;

ALTER TABLE upchieve.feedbacks
    ALTER COLUMN student_tutoring_feedback TYPE jsonb,
    ALTER COLUMN student_counseling_feedback TYPE jsonb,
    ALTER COLUMN volunteer_feedback TYPE jsonb,
    ALTER COLUMN legacy_feedbacks TYPE jsonb;

ALTER TABLE upchieve.pre_session_surveys
    ALTER COLUMN response_data TYPE jsonb;

-- migrate:down
ALTER TABLE upchieve.volunteer_profiles
    ALTER COLUMN experience TYPE json;

ALTER TABLE upchieve.feedbacks
    ALTER COLUMN student_tutoring_feedback TYPE json,
    ALTER COLUMN student_counseling_feedback TYPE json,
    ALTER COLUMN volunteer_feedback TYPE json,
    ALTER COLUMN legacy_feedbacks TYPE json;

ALTER TABLE upchieve.pre_session_surveys
    ALTER COLUMN response_data TYPE json;

