-- migrate:up
SET LOCAL lock_timeout = '5s';

-- The following tables already have a column that is non-null with index. Promote
-- those to primary key.
ALTER TABLE upchieve.survey_questions_response_choices
    ADD CONSTRAINT survey_questions_response_choices_pkey PRIMARY KEY USING INDEX survey_questions_response_choices_response_survey_question;

ALTER TABLE upchieve.users_schools
    ADD CONSTRAINT users_schools_pkey PRIMARY KEY (user_id);

ALTER TABLE upchieve.users_schools
    DROP CONSTRAINT users_schools_unique_user_id;

ALTER TABLE upchieve.nths_group_school_affiliation
    ADD CONSTRAINT nths_group_school_affiliation_pkey PRIMARY KEY (nths_group_id);

ALTER TABLE upchieve.nths_group_school_affiliation
    DROP CONSTRAINT nths_group_school_affiliation_nths_group_id_key;

-- The following tables have a couple non-null columns that, combined, could be used
-- as composite primary key.
ALTER TABLE upchieve.moderation_rule_actions
    ADD CONSTRAINT moderation_rule_actions_pkey PRIMARY KEY (rule_id, action_id);

ALTER TABLE upchieve.moderation_rules_flags
    ADD CONSTRAINT moderation_rules_flags_pkey PRIMARY KEY (flag_id, rule_id);

ALTER TABLE upchieve.session_photos
    ADD CONSTRAINT session_photos_pkey PRIMARY KEY (session_id, photo_key);

-- The following tables need to have primary key generated.
ALTER TABLE upchieve.moderation_settings
    ADD COLUMN id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY;

ALTER TABLE upchieve.surveys_context
    ADD COLUMN id integer NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY;

ALTER TABLE upchieve.users_surveys_submissions
    ADD COLUMN id uuid NOT NULL DEFAULT upchieve.generate_ulid () PRIMARY KEY;

ALTER TABLE upchieve.schools_sponsor_orgs_instances
    ADD COLUMN id uuid NOT NULL DEFAULT upchieve.generate_ulid () PRIMARY KEY;

ALTER TABLE upchieve.session_failed_joins
    ADD COLUMN id uuid NOT NULL DEFAULT upchieve.generate_ulid () PRIMARY KEY;

ALTER TABLE upchieve.sponsor_orgs_volunteer_partner_orgs_instances
    ADD COLUMN id uuid NOT NULL DEFAULT upchieve.generate_ulid () PRIMARY KEY;

ALTER TABLE upchieve.student_partner_orgs_sponsor_orgs_instances
    ADD COLUMN id uuid NOT NULL DEFAULT upchieve.generate_ulid () PRIMARY KEY;

ALTER TABLE upchieve.student_partner_orgs_volunteer_partner_orgs_instances
    ADD COLUMN id uuid NOT NULL DEFAULT upchieve.generate_ulid () PRIMARY KEY;

ALTER TABLE upchieve.users_student_partner_orgs_instances
    ADD COLUMN id uuid NOT NULL DEFAULT upchieve.generate_ulid () PRIMARY KEY;

ALTER TABLE upchieve.users_volunteer_partner_orgs_instances
    ADD COLUMN id uuid NOT NULL DEFAULT upchieve.generate_ulid () PRIMARY KEY;

-- migrate:down
ALTER TABLE upchieve.users_volunteer_partner_orgs_instances
    DROP COLUMN id;

ALTER TABLE upchieve.users_student_partner_orgs_instances
    DROP COLUMN id;

ALTER TABLE upchieve.student_partner_orgs_volunteer_partner_orgs_instances
    DROP COLUMN id;

ALTER TABLE upchieve.student_partner_orgs_sponsor_orgs_instances
    DROP COLUMN id;

ALTER TABLE upchieve.sponsor_orgs_volunteer_partner_orgs_instances
    DROP COLUMN id;

ALTER TABLE upchieve.session_failed_joins
    DROP COLUMN id;

ALTER TABLE upchieve.schools_sponsor_orgs_instances
    DROP COLUMN id;

ALTER TABLE upchieve.users_surveys_submissions
    DROP COLUMN id;

ALTER TABLE upchieve.surveys_context
    DROP COLUMN id;

ALTER TABLE upchieve.moderation_settings
    DROP COLUMN id;

ALTER TABLE upchieve.session_photos
    DROP CONSTRAINT session_photos_pkey;

ALTER TABLE upchieve.moderation_rules_flags
    DROP CONSTRAINT moderation_rules_flags_pkey;

ALTER TABLE upchieve.moderation_rule_actions
    DROP CONSTRAINT moderation_rule_actions_pkey;

ALTER TABLE upchieve.nths_group_school_affiliation
    ADD CONSTRAINT nths_group_school_affiliation_nths_group_id_key UNIQUE (nths_group_id);

ALTER TABLE upchieve.nths_group_school_affiliation
    DROP CONSTRAINT nths_group_school_affiliation_pkey;

ALTER TABLE upchieve.users_schools
    ADD CONSTRAINT users_schools_unique_user_id UNIQUE (user_id);

ALTER TABLE upchieve.users_schools
    DROP CONSTRAINT users_schools_pkey;

ALTER TABLE upchieve.survey_questions_response_choices
    DROP CONSTRAINT survey_questions_response_choices_pkey;

CREATE UNIQUE INDEX survey_questions_response_choices_response_survey_question ON upchieve.survey_questions_response_choices (response_choice_id, surveys_survey_question_id);

