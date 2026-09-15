-- migrate:up
COMMENT ON COLUMN upchieve.moderation_infractions.quarantined_on IS 'not_pii: Timestamp when the image that triggered the infraction was quarantined';

COMMENT ON COLUMN upchieve.moderation_settings.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_failed_joins.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_last_seen.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_last_seen.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.session_last_seen.last_seen_at IS 'not_pii: Timestamp when the user last viewed the session''s messages';

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.surveys_context.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.user_session_metrics.graded_assignment IS 'not_pii: Count of graded-assignment session flags';

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.users_surveys_submissions.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.id IS 'not_pii: Primary key';

-- migrate:down
COMMENT ON COLUMN upchieve.moderation_infractions.quarantined_on IS NULL;

COMMENT ON COLUMN upchieve.moderation_settings.id IS NULL;

COMMENT ON COLUMN upchieve.schools_sponsor_orgs_instances.id IS NULL;

COMMENT ON COLUMN upchieve.session_failed_joins.id IS NULL;

COMMENT ON COLUMN upchieve.session_last_seen.session_id IS NULL;

COMMENT ON COLUMN upchieve.session_last_seen.user_id IS NULL;

COMMENT ON COLUMN upchieve.session_last_seen.last_seen_at IS NULL;

COMMENT ON COLUMN upchieve.sponsor_orgs_volunteer_partner_orgs_instances.id IS NULL;

COMMENT ON COLUMN upchieve.student_partner_orgs_sponsor_orgs_instances.id IS NULL;

COMMENT ON COLUMN upchieve.student_partner_orgs_volunteer_partner_orgs_instances.id IS NULL;

COMMENT ON COLUMN upchieve.surveys_context.id IS NULL;

COMMENT ON COLUMN upchieve.user_session_metrics.graded_assignment IS NULL;

COMMENT ON COLUMN upchieve.users_student_partner_orgs_instances.id IS NULL;

COMMENT ON COLUMN upchieve.users_surveys_submissions.id IS NULL;

COMMENT ON COLUMN upchieve.users_volunteer_partner_orgs_instances.id IS NULL;

