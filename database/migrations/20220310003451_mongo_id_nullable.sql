-- migrate:up
ALTER TABLE upchieve.ip_addresses
    ALTER COLUMN mongo_id DROP NOT NULL;

ALTER TABLE upchieve.users
    ALTER COLUMN mongo_id DROP NOT NULL;

ALTER TABLE upchieve.schools
    ALTER COLUMN mongo_id DROP NOT NULL;

ALTER TABLE upchieve.sessions
    ALTER COLUMN mongo_id DROP NOT NULL;

ALTER TABLE upchieve.quiz_questions
    ALTER COLUMN mongo_id DROP NOT NULL;

ALTER TABLE upchieve.user_actions
    ALTER COLUMN mongo_id DROP NOT NULL;

ALTER TABLE upchieve.session_messages
    ALTER COLUMN mongo_id DROP NOT NULL;

ALTER TABLE upchieve.feedbacks
    ALTER COLUMN mongo_id DROP NOT NULL;

ALTER TABLE upchieve.ineligible_students
    ALTER COLUMN mongo_id DROP NOT NULL;

ALTER TABLE upchieve.notifications
    ALTER COLUMN mongo_id DROP NOT NULL;

ALTER TABLE upchieve.pre_session_surveys
    ALTER COLUMN mongo_id DROP NOT NULL;

-- migrate:down
ALTER TABLE upchieve.ip_addresses
    ALTER COLUMN mongo_id SET NOT NULL;

ALTER TABLE upchieve.users
    ALTER COLUMN mongo_id SET NOT NULL;

ALTER TABLE upchieve.schools
    ALTER COLUMN mongo_id SET NOT NULL;

ALTER TABLE upchieve.sessions
    ALTER COLUMN mongo_id SET NOT NULL;

ALTER TABLE upchieve.quiz_questions
    ALTER COLUMN mongo_id SET NOT NULL;

ALTER TABLE upchieve.user_actions
    ALTER COLUMN mongo_id SET NOT NULL;

ALTER TABLE upchieve.session_messages
    ALTER COLUMN mongo_id SET NOT NULL;

ALTER TABLE upchieve.feedbacks
    ALTER COLUMN mongo_id SET NOT NULL;

ALTER TABLE upchieve.ineligible_students
    ALTER COLUMN mongo_id SET NOT NULL;

ALTER TABLE upchieve.notifications
    ALTER COLUMN mongo_id SET NOT NULL;

ALTER TABLE upchieve.pre_session_surveys
    ALTER COLUMN mongo_id SET NOT NULL;

