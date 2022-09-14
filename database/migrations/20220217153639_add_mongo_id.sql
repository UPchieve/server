-- migrate:up
ALTER TABLE upchieve.ip_addresses
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

ALTER TABLE upchieve.users
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

ALTER TABLE upchieve.schools
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

ALTER TABLE upchieve.sessions
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

ALTER TABLE upchieve.quiz_questions
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

ALTER TABLE upchieve.user_actions
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

ALTER TABLE upchieve.session_messages
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

ALTER TABLE upchieve.feedbacks
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

ALTER TABLE upchieve.ineligible_students
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

ALTER TABLE upchieve.notifications
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

ALTER TABLE upchieve.pre_session_surveys
    ADD COLUMN mongo_id VARCHAR(24) NOT NULL UNIQUE;

-- migrate:down
ALTER TABLE upchieve.ip_addresses
    DROP COLUMN mongo_id;

ALTER TABLE upchieve.users
    DROP COLUMN mongo_id;

ALTER TABLE upchieve.schools
    DROP COLUMN mongo_id;

ALTER TABLE upchieve.sessions
    DROP COLUMN mongo_id;

ALTER TABLE upchieve.quiz_questions
    DROP COLUMN mongo_id;

ALTER TABLE upchieve.user_actions
    DROP COLUMN mongo_id;

ALTER TABLE upchieve.session_messages
    DROP COLUMN mongo_id;

ALTER TABLE upchieve.feedbacks
    DROP COLUMN mongo_id;

ALTER TABLE upchieve.ineligible_students
    DROP COLUMN mongo_id;

ALTER TABLE upchieve.notifications
    DROP COLUMN mongo_id;

ALTER TABLE upchieve.pre_session_surveys
    DROP COLUMN mongo_id;

