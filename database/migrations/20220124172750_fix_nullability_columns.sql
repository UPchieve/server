-- migrate:up
ALTER TABLE upchieve.availabilities
    ALTER COLUMN timezone SET NOT NULL,
    ALTER COLUMN available_start SET NOT NULL,
    ALTER COLUMN available_end SET NOT NULL;

ALTER TABLE upchieve.availability_histories
    ALTER COLUMN recorded_at SET NOT NULL,
    ALTER COLUMN timezone SET NOT NULL,
    ALTER COLUMN available_start SET NOT NULL,
    ALTER COLUMN available_end SET NOT NULL;

ALTER TABLE upchieve.user_actions
    ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE upchieve.student_profiles
    ALTER COLUMN student_partner_org_user_id TYPE text;

ALTER TABLE upchieve.sessions
    ALTER COLUMN student_id SET NOT NULL,
    ALTER COLUMN to_review SET NOT NULL,
    ALTER COLUMN to_review SET DEFAULT FALSE,
    ALTER COLUMN reviewed SET NOT NULL,
    ALTER COLUMN reviewed SET DEFAULT FALSE,
    ALTER COLUMN time_tutored SET NOT NULL,
    ALTER COLUMN time_tutored SET DEFAULT 0;

ALTER TABLE upchieve.session_messages
    ALTER COLUMN sender_id SET NOT NULL,
    ALTER COLUMN contents SET NOT NULL;

ALTER TABLE upchieve.references
    ALTER COLUMN status_id SET NOT NULL;

ALTER TABLE upchieve.pre_session_surveys
    ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE upchieve.notifications
    ALTER COLUMN session_id SET NOT NULL;

ALTER TABLE upchieve.feedbacks
    ALTER COLUMN session_id SET NOT NULL,
    ALTER COLUMN user_role_id SET NOT NULL,
    ALTER COLUMN user_id SET NOT NULL;

-- migrate:down
ALTER TABLE upchieve.availabilities
    ALTER COLUMN timezone DROP NOT NULL,
    ALTER COLUMN available_start DROP NOT NULL,
    ALTER COLUMN available_end DROP NOT NULL;

ALTER TABLE upchieve.availability_histories
    ALTER COLUMN recorded_at DROP NOT NULL,
    ALTER COLUMN timezone DROP NOT NULL,
    ALTER COLUMN available_start DROP NOT NULL,
    ALTER COLUMN available_end DROP NOT NULL;

ALTER TABLE upchieve.user_actions
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE upchieve.student_profiles
    ALTER COLUMN student_partner_org_user_id TYPE TEXT;

ALTER TABLE upchieve.sessions
    ALTER COLUMN student_id DROP NOT NULL,
    ALTER COLUMN to_review DROP NOT NULL,
    ALTER COLUMN to_review DROP DEFAULT,
    ALTER COLUMN reviewed DROP NOT NULL,
    ALTER COLUMN reviewed DROP DEFAULT,
    ALTER COLUMN time_tutored DROP NOT NULL,
    ALTER COLUMN time_tutored DROP DEFAULT;

ALTER TABLE upchieve.session_messages
    ALTER COLUMN sender_id DROP NOT NULL,
    ALTER COLUMN contents DROP NOT NULL;

ALTER TABLE upchieve.references
    ALTER COLUMN status_id DROP NOT NULL;

ALTER TABLE upchieve.pre_session_surveys
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE upchieve.notifications
    ALTER COLUMN session_id DROP NOT NULL;

ALTER TABLE upchieve.feedbacks
    ALTER COLUMN session_id DROP NOT NULL,
    ALTER COLUMN user_role_id DROP NOT NULL,
    ALTER COLUMN user_id DROP NOT NULL;

